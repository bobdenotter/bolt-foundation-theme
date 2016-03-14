Foundation for Bolt Theme
=========================

Foundation for Bolt is a blank theme for Bolt, built on top of [Zurb Foundation for sites 6](http://foundation.zurb.com/). To learn more about specific Foundation components, check out the [Foundation 6 Documentation](http://foundation.zurb.com/sites/docs/).

The documentation laid in this README will cover how to get started with Foundation for Bolt and how some Foundation components, are integrated with Bolt.

Features included with Foundation for Bolt?
-------------------------------------------

Foundation for Bolt comes with all of the great features that are found in the Zurb Foundation framework, and a few things more. Simply put, if it works in Foundation, it will work in Foundation for Bolt. The theme also includes:

 - Sass(scss) or CSS Versions
 - Multiple Foundation Navigation and layout options
 - Optional Bower and Gulp Support
 - And much, much more!

Requirements for Foundation for Bolt
------------------------------------

You can use whatever you want – seriously. You can use CodeKit, Grunt, Compass or nothing at all. It’s completely up to you how you decide to build your theme – Foundation for Bolt will stay out of your workflow as much as possible.

This theme does include Bower and Gulp files, and is optimized for a Gulp-based workflow. To get the most out of Foundation for Bolt, Gulp is highly recommended. However, if you're not using Gulp yet, you can also modify the compiled CSS files as is.

File Structure
--------------

These are the most important files, included in this theme.

```
.
├── css/
│   ├── foundation.css       - The compiled Foundation CSS framework
│   └── theme.css            - Theme-specific CSS
├── images/                  - Image files for this theme are put here
├── js/
│   ├── app.js               - Theme-specific Javascript
│   ├── foundation.js        - The compiled Foundation javascript library
│   └── jquery.min.js        - The jQuery javascript library
├── partials/
│   ├── _aside.twig          - Partial for the sidebar. With fixed content, or widgets
│   ├── _footer.twig         - Partial for the footer below every page
│   ├── _fresh_install.twig  - Partial that's shown on fresh installs with some instructions
│   ├── _header.twig         - Partial for the header banner with the site title.
│   ├── _master.twig         - Twig template, that is uses to 'extend' all pages (See 'template inheritance')
│   ├── _recordfooter.twig   - Partial with meta-information below a page or entry
│   ├── _sub_menu.twig       - Partial with macro for rendering the drop-down menu
│   └── _topbar.twig         - Partial containing the top menu bar
├── source/
│   ├── scss/
│   │   ├── _settings.scss   - SCSS source file for Foundation. Is used by `css/foundation.css`
│   │   ├── foundation.scss  - SCSS source file for Foundation. Is compiled to `scss/foundation.scss`
│   │   └── theme.scss       - SCSS source file for the theme. Is compiled to `css/theme.css`
│   ├── .babelrc             - Helper file for gulp / npm
│   ├── bower.json           - Configuration for used Bower packages.
│   ├── gulpfile.js          - Build task script for Gulp.
│   └── package.json         - Configuration for used Node / Gulp packages.
├── CHANGELOG.md             - List of versions, and their respective changes.
├── index.twig               - Template used for 'home'
├── listing.twig             - Template used for 'listings', like `/pages` or `/category/movies`
├── notfound.twig            - Template used for the '404 not found' pages
├── page.twig                - Template used for single record pages, like `/page/lorem-ipsum`
├── readme.md                - This file. :-)
├── record.twig              - Generic template used for single record pages, that don't have a specific template set.
├── search.twig              - Template used for listing search results.
├── styleguide.twig          - Static page, that shows all Foundation elements on one long page. Go to `/styleguide` to see it in the browser.
└── theme.yml                - Theme-specific configuration.
```


