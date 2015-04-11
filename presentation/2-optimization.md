---
title: Frontend Performance Optimization
---

# Frontend Performance Optimization

## Browser DevTools

> _Note: We are most familiar with Chrome and so all of the examples will follow suit. However, most of the tools demoed are available in all browsers._

Every browser has a powerful set of **development tools** (DevTools) lurking inside, waiting for you to unlock its full potential. Every type of browser performance problem, from page loads to animation jank, can be debugged directly in the browser. We will cover the most oft-used tools.

<dl>
{% for tool in site.browser %}
    {% include list-tools.html %}
{% endfor %}
</dl>

## Drupal Modules

Drupal offers a number of modules specifically designed to improve frontend performance. Combined with a well-made theme, these modules can help your Drupal sites fly!

<dl>
{% for tool in site.drupal %}
    {% include list-tools.html %}
{% endfor %}
</dl>

## Workflow Automation

Sometimes installing a module won't cut it, and you'll need to rely on additional tools to improve your workflow itself. In the context of Drupal these are often handled within your theme.

### Automation tools

With these tools you will be able to capture repetitive tasks and run them automatically whenever you need them. It might be as frequent as a file save, or only once per deploy. But either way, having an automated workflow is less error-prone and more reliable than manually remembering and executing the tasks.

<dl>
{% for tool in site.automation %}
    {% include list-tools.html %}
{% endfor %}
</dl>

### Optimization tools

Here is a list of tools we frequently use in our frontend workflow:

<dl>
{% for tool in site.workflow %}
    {% include list-tools.html %}
{% endfor %}
</dl>