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

Twig files (the actual 'templates') :

```
.
├── css/
│   ├── foundation.css
│   └── theme.css
├── images/
├── js/
│   ├── app.js
│   ├── foundation.js
│   └── jquery.min.js
├── partials/
│   ├── _aside.twig
│   ├── _footer.twig
│   ├── _fresh_install.twig
│   ├── _header.twig
│   ├── _master.twig
│   ├── _recordfooter.twig
│   ├── _sub_menu.twig
│   └── _topbar.twig
├── source/
│   ├── scss/
│   │   ├── _settings.scss   - SCSS source file for Foundation. Is used by `css/foundation.css`.
│   │   ├── foundation.scss  - SCSS source file for Foundation. Is compiled to `scss/foundation.scss`.
│   │   └── theme.scss       - SCSS source file for the theme. Is compiled to `css/theme.css`.
│   ├── .babelrc
│   ├── bower.json
│   ├── gulpfile.js
│   └── package.json
├── CHANGELOG.md
├── index.twig
├── listing.twig
├── notfound.twig
├── page.twig
├── readme.md
├── record.twig
├── search.twig
├── styleguide.twig
└── theme.yml
```
