# Contributing to ProDash

We love your input! We want to make contributing to ProDash as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. **Fork the repo** and create your branch from `main`.
2. **Create a feature branch**: `git checkout -b feature/my-new-feature`
3. **Make your changes** following our coding standards (see below)
4. **Test your changes** by opening `index.html` in multiple browsers
5. **Ensure responsive design** works on mobile, tablet, and desktop
6. **Update documentation** if you've added functionality
7. **Commit with clear messages**: `git commit -m "Add feature: describe what you added"`
8. **Push to your fork**: `git push origin feature/my-new-feature`
9. **Submit a pull request** with a clear description of your changes

## Coding Standards

Since ProDash uses vanilla JavaScript, HTML, and CSS, please follow these conventions:

### JavaScript
- Use **ES6+ features** (const/let, arrow functions, template literals)
- Use **semicolons** consistently
- Use **camelCase** for variables and functions
- Use **meaningful variable names**
- Add **JSDoc comments** for complex functions
- Avoid global variables when possible
- Use **async/await** for asynchronous operations

```javascript
// Good
const getUserTasks = async (userId) => {
    const tasks = await localStorage.getItem(`tasks_${userId}`);
    return JSON.parse(tasks) || [];
};

// Avoid
function get_user_tasks(user_id) {
    var tasks = localStorage.getItem("tasks_" + user_id)
    return JSON.parse(tasks) || []
}
```

### HTML
- Use **semantic HTML5** elements (`<main>`, `<section>`, `<article>`, etc.)
- Include proper **ARIA labels** for accessibility
- Use **meaningful class names** (BEM methodology preferred)
- Ensure **proper heading hierarchy** (h1 → h2 → h3)
- Add **alt text** for images

```html
<!-- Good -->
<section class="task-list" role="region" aria-label="Task Management">
    <h2 class="task-list__title">My Tasks</h2>
    <button class="btn btn--primary" aria-label="Add new task">
        + Add Task
    </button>
</section>
```

### CSS
- Use **CSS Grid** and **Flexbox** for layouts
- Follow **mobile-first** responsive design
- Use **CSS custom properties** (variables) for theming
- Use **BEM naming convention** for classes
- Group related properties together
- Avoid `!important` unless absolutely necessary

```css
/* Good */
.task-card {
    display: flex;
    flex-direction: column;
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    background-color: var(--color-surface);
    transition: transform 0.2s ease;
}

.task-card:hover {
    transform: translateY(-2px);
}
```

## File Organization

- **Modules**: Each feature should be in its own file in the `modules/` directory
- **Styles**: Use the main `styles.css` or create feature-specific CSS files
- **Assets**: Place images, fonts, etc. in appropriate directories
- **Documentation**: Update README.md for new features

## Accessibility Guidelines

ProDash should be accessible to everyone:

- Ensure **keyboard navigation** works for all interactive elements
- Use **proper ARIA labels** and roles
- Maintain **sufficient color contrast** (WCAG AA)
- Test with **screen readers** when possible
- Provide **alternative text** for visual content

## Testing

Since we don't use automated testing frameworks, please manually test:

### Browser Testing
- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (if on macOS)
- **Edge** (latest)

### Device Testing
- **Desktop** (1920x1080, 1366x768)
- **Tablet** (768px width)
- **Mobile** (375px width, 320px width)

### Feature Testing
- Test all **CRUD operations** (Create, Read, Update, Delete)
- Verify **local storage** persistence
- Check **theme switching** works
- Test **responsive behavior**
- Verify **keyboard navigation**

## Issues

We use GitHub issues to track public bugs and feature requests.

### Bug Reports
When filing a bug report, please include:

- **Browser** and version
- **Operating system**
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable

### Feature Requests
For feature requests, please include:

- **Clear description** of the feature
- **Use case** - why would this be useful?
- **Possible implementation** ideas (if you have any)

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand the standards we expect from our community.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Getting Help

- 📧 Email: [YOUR_EMAIL@example.com]
- 💬 GitHub Discussions: Use the Discussions tab for questions
- 🐛 Issues: Use GitHub Issues for bugs and feature requests

## Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- GitHub contributors page
- Release notes for significant contributions

---

Thank you for contributing to ProDash! Your efforts help make productivity tools better for everyone. 🎉
