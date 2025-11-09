### Feature: Back-in-Stock (centralized store + component-local logic + dedicated form)

- **Goal**: Allow buyers to request notification when an out-of-stock variant becomes available, using a centralized Alpine store for shared state, a root component for local UI logic, and a dedicated form component for validation and API interaction.
- **Outcomes**: Consistent state across UI; clean separation of concerns; small, readable snippets; compliant with theme rules (Liquid/UX/JS/CSS).

### Scope

- **Store**: Centralized `$store.backInStock` (shared state + minimal request status).
- **Root component**: `back-in-stock` context (x-data) for local UI logic proxied to the store.
- **Snippets**: Button, Modal, Form. Button and modal can be markup-only; form is its own Alpine component.
- **API**: Form component owns validation and API call; reports simplified status back to store.
- **Translations**: Keys added to `locales/en.default.json`.
- **Accessibility**: Modal uses proper roles/aria; focus/keyboard behavior.
- **No-goals**: Notification service backend, email templating, queueing, or admin UI.

### Architecture

- **Store** (`src/stores/backInStock.store.js`)
  - State: `isModalOpen`, `selectedVariantId`, `requestStatus` ('idle'|'loading'|'success'|'error'), `requestMessage`, `requestError`, `lastSubmission`.
  - Methods: `init()`, `setVariantId(id)`, `openModal()`, `closeModal()`, `setRequestPending()`, `setRequestSuccess(message, payload)`, `setRequestError(message)`, `clearRequestState()`.
- **Root component** (`src/components/snippets/back-in-stock/back-in-stock.alpine.js`)
  - Proxies: `get isModalOpen()`, `openModal()`, `closeModal()` → `$store.backInStock`.
  - Room for local UI logic without polluting the store.
- **Button** (`back-in-stock-button.liquid`)
  - Click → `$store.backInStock.openModal()`.
- **Modal** (`back-in-stock-modal.liquid`)
  - Visibility bound to `$store.backInStock.isModalOpen`.
  - Close actions → `$store.backInStock.closeModal()`.
  - Shows selected variant id for debugging/UX cues (optional).
- **Form** (`back-in-stock-form.alpine.js` + `.liquid`)
  - Local state: `email`, `isSubmitting`, `emailError`, `submissionMessage`.
  - Methods: `validateEmail`, `onSubmit` (calls API, sets store request state).
  - On success: `setRequestSuccess`, display message, optionally closes modal.

### Implementation tasks

- **Store**:
  - Ensure store is imported in `src/components/layout/theme.js`.
  - Implement state + methods above.
  - Init `selectedVariantId` from `?variant=` query param.
- **Root**:
  - Keep `x-data="backInStock({})"` on root wrapper.
  - Proxy getters/methods to store.
- **Button**:
  - Bind click to `$store.backInStock.openModal()`.
- **Modal**:
  - Bind `x-show` and backdrop to `$store.backInStock.isModalOpen`.
  - Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
  - Keep transitions and `x-cloak`.
- **Form**:
  - Add `x-data="backInStockForm({})"`.
  - Add `x-model="email"`, submit handler `@submit.prevent="onSubmit()"`.
  - Show validation errors and submission messages.
  - Placeholder API call; wire success/error to store helpers.
- **Variant synchronization**:
  - From variant selection UI (existing component), call `$store.backInStock.setVariantId(variantId)`.
- **Translations**:
  - Add keys to `locales/en.default.json`: button text, headings, messages, errors.
- **Accessibility**:
  - Ensure focus moves into the modal on open and returns on close (tab focusable close button).
  - Backdrop click and Escape key close.
- **Analytics (optional)**:
  - Dispatch custom events on open/close/success/failure.
- **Docs**:
  - Add README section explaining store responsibilities vs. form component.

### API integration (placeholder to real)

- Endpoint: `POST /apps/back-in-stock/subscribe`
- Payload: `{ email: string, variantId: number | string }`
- Success: 2xx with message
- Failure: non-2xx with message
- Form handles request lifecycle; store only mirrors simplified status.

### Acceptance criteria

- **State management**
  - Centralized store is the single source of truth for modal visibility and selected variant id.
  - Root component proxies to the store without duplicating state.
- **Button behavior**
  - Clicking the button opens the modal via the store.
- **Modal behavior**
  - Modal/backdrop visibility reflect store state.
  - Close button and clicking backdrop close the modal via the store.
  - Escape key closes the modal.
- **Form validation**
  - Submitting with empty/invalid email shows validation error; no request sent.
  - Submitting without a `selectedVariantId` shows an error; no request sent.
- **Form submission**
  - While submitting, button shows loading state; repeated clicks are prevented.
  - On success, store `requestStatus=success`, `lastSubmission` populated; success message shown; modal closes.
  - On failure, store `requestStatus=error`, error message shown.
- **Variant sync**
  - If `?variant=` is present in URL, `selectedVariantId` initializes accordingly.
  - When variant changes on PDP, `selectedVariantId` in the store updates, reflected in modal.
- **Accessibility**
  - Modal uses `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
  - Focus is trapped inside the modal while open; focus returns to triggering button on close.
  - Modal/backdrop are hidden from screen readers when closed.
- **Translations**
  - All visible strings are sourced from `locales/en.default.json` via `t` filter.
- **Coding standards**
  - Follows Liquid filters/tags whitelist, theme folder structure, CSS specificity rules, and JS guidelines (no var, module pattern, early returns).
- **SSR and JS**
  - No UI depends on client-side rendering for static content; Alpine enhances behavior progressively.
- **Quality**
  - No linter errors; no console errors in happy path.
  - Works across modern browsers; graceful degradation if JS disabled (button does nothing).

### Test scenarios

- Open/Close: Button click opens; close button/backdrop/Escape close.
- Validation: Invalid email; no variant selected; both show errors.
- Success: Valid email + variant → success message, modal closes, store status success.
- Failure: Simulate API error → error message, store status error.
- URL variant: Load with `?variant=ID` → modal shows correct variant id.
- Accessibility: Tab navigation, screen-reader attributes, focus behavior.

### Rollout

- Implement and merge behind branch `feature/back-in-stock`.
- Verify on PDP and any other context using the snippet.
- Provide endpoint config and environment switches for dev/prod.
- Handover docs.

If you want, I can add the translation keys and an example fetch implementation once you share the real endpoint and message format.
