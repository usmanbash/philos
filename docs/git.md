# **Git Workflow Guide**

## **Overview of Branches**

- **master**: The production branch. This branch mirrors what's currently live. Must always be stable.
- **staging**: The pre-production branch. Used for testing before releases.
- **dev**: Main branch for ongoing development. All feature development starts and ends here before moving to staging.

## **Branch Naming Conventions**

- Use lowercase, kebab-case (e.g., `section-callout`).
- Prefix branches according to their purpose:
  - `feature/` for new features (e.g., `feature/mini-cart`).
  - `fix/` for bug fixes (e.g., `fix/date-format`).
  - `refactor/` for code refactoring (e.g., `refactor/update-libraries`).

## **Development Workflow**

### **1. Starting New Work**

- Always branch out from the latest dev branch.
- Begin by updating your local `dev` branch:
  ```bash
  git fetch
  git checkout dev
  git pull origin dev
  ```
- Create a new branch off `dev` for your feature or bug fix. Name it descriptively, e.g., `feature/section-hero` or `fix/hero-styles`:
  ```bash
  git checkout -b feature/template-product
  ```

### **2. Developing Your Feature**

- Make your changes, write code, test locally.
- Make one or multiple commits to your branch.
- Keep your commits small and focused.
- Commit your changes with clear, descriptive commit messages:
  ```bash
  git add .
  git commit -m "add new block to product gallery section"
  ```

### **3. Incorporating Latest `dev` Changes Regularly**

- Regularly pull in changes from `dev` to your feature branch to stay up-to-date and resolve conflicts early:
  ```bash
  git fetch
  git rebase origin/dev
  ```
- If you encounter merge conflicts during rebase, resolve them manually in your code editor, then continue the rebase:
  ```bash
  git add <resolved-files>
  git rebase --continue
  ```
  ⚠️ Test your changes after the rebase to ensure nothing breaks.

### **4. Preparing for Pull Request (PR)**

- Before creating a PR, ensure your branch is up to date with `dev` and has been tested thoroughly:
  ```bash
  git fetch origin
  git rebase origin/dev
  ```
- Push your branch to GitHub:
  ```bash
  git push origin feature/product-gallery-zoom
  ```
- Go to the GitHub repository page and click on "New Pull Request".
- Select your branch (compare) and `dev` as the base branch.
- Fill in the PR template, summarizing your changes and any notes for reviewers.

### **5. Code Review and Merging**

- Request reviews from your teammates. Address any comments or required changes promptly.
- Once approved, merge the PR into `dev`. GitHub offers several merge options; **use "Squash and Merge"** for a clean history.
- Delete the feature branch from GitHub after merging.

### **6. Deploying Changes**

- Changes are periodically merged from `dev` to `staging` for testing.
- Once tested, changes are merged from `staging` to `master` and deployed to production.

## **Best Practices**

- Keep commits small and focused for easier code review and troubleshooting.
- Regularly pull changes from `dev` to avoid large merge conflicts.
- Test thoroughly before pushing changes and opening PRs.
- Engage in code reviews promptly and constructively.

---

This workflow encourages collaboration, minimizes conflicts, and ensures that our codebase remains clean and manageable.

`master` and `dev` branches should be protected. These protected branches should never be directly committed to. They should only be updated through PR merges.
