var fs   = require('fs'),
    path = require('path'),

    dest      = './build/';

module.exports = function (grunt) {
    // =================
    // = GRUNT PLUGINS =
    // =================
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-clean');
    // grunt.loadNpmTasks('grunt-recess');
    // grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    // =================

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            compile: {
                options: {
                    appDir: 'extension/chrome/content/scripts',
                    baseUrl: './',
                    dir: 'release',
                    skipDirOptimize: false,
                    paths: {
                        'jquery': 'lib/jquery',
                        'mustache': 'lib/mustache',
                        'text': 'lib/text',
                        'app': 'app',
                        'components': 'components',
                        'data': 'app/data',
                        'template': 'template'
                    },
                    modules: [{name:'main'}],
                    generateSourceMaps: false,
                    uglify: {
                        toplevel: true,
                        max_line_length: 140
                    },
                    optimizeCss: 'none',
                    inlineText: true
                }
            }
        },

        // clean: {
        //     build: [path.join(dest, '*')],
        //     src:   ['chrome/content/*']
        // },

        // uglify: {
        //     options: {
        //         // report: 'gzip' // takes time to calculate
        //     },
        //     build: {
        //         src: [
        //             path.join('extension/chrome/content/scripts/lib/*.js'),
        //             path.join('extension/chrome/content/scripts/app/*.js'),
        //             path.join('extension/chrome/content/scripts/components/*.js'),
        //             path.join('extension/chrome/content/scripts/main.js')
        //         ],
        //         dest: 'build/main.min.js'
        //     },
        // },

        // concat: {
        //     rpresenter: {
        //         src: [
        //             'templates/rpresenter.prefix',
        //             'src/js/rpresenter/*.js',
        //             // 'src/js/rpresenter/define.js',
        //             // 'src/js/rpresenter/bridge.js',
        //             // 'src/js/rpresenter/dom.js',
        //             // 'src/js/rpresenter/main.js',
        //             'templates/rpresenter.suffix'
        //         ],
        //         dest: 'chrome/content/js/rpresenter.js'
        //     },
        //     vendors: {
        //         src: [
        //             'src/vendor/jquery/jquery.js',
        //             'src/vendor/underscore/underscore.js',
        //             'src/vendor/mustache/mustache.js'
        //         ],
        //         dest: 'chrome/content/js/vendors.js'
        //     }
        // },

        // recess: {
        //     options: {
        //         compile: true,
        //     },
        //     less: {
        //         src: ['src/less/rpresenter.less'],
        //         dest: 'src/css/rpresenter.css'
        //     },
        //     demo: {
        //         src: ['test/less/demo.less'],
        //         dest: 'test/demo.css'
        //     }
        //     // less_min: {
        //     //     options: {
        //     //         compress: true
        //     //     },
        //     //     src: ['src/less/rpresenter.less'],
        //     //     dest: 'build/css/release<%=pkg.version%>.min.css'
        //     // }
        // },

        copy: {
            vendors: {
                files: [
                {
                    expand: true,
                    src: ['jquery.js'],
                    dest: path.join('extension', 'chrome', 'content', 'scripts', 'lib/'),
                    cwd: 'vendors/jquery/'
                },
                {
                    expand: true,
                    src: ['mustache.js'],
                    dest: path.join('extension', 'chrome', 'content', 'scripts', 'lib/'),
                    cwd: 'vendors/mustache/'
                },
                {
                    expand: true,
                    src: ['require.js'],
                    dest: path.join('extension', 'chrome', 'content', 'scripts', 'lib/'),
                    cwd: 'vendors/requirejs/'
                },
                {
                    expand: true,
                    src: ['text.js'],
                    dest: path.join('extension', 'chrome', 'content', 'scripts', 'lib/'),
                    cwd: 'vendors/requirejs-text/'
                },
                {
                    expand: true,
                    src: ['underscore.js'],
                    dest: path.join('extension', 'chrome', 'content', 'scripts', 'lib/'),
                    cwd: 'vendors/underscore-amd/'
                }]
            },
        //     js: {
        //         expand: true,
        //         src: ['**'],
        //         dest: path.join('chrome', 'content', 'js/'),
        //         cwd: 'src/js/'
        //     }
        },

        // watch: {
        //     options: {
        //         dateFormat: function(time) {
        //             grunt.log.writeln('The watch finished in ' + time + 'ms at' + (new Date()).toString());
        //             grunt.log.writeln('watching...');
        //         },
        //         livereload: 8010
        //     },
        //     src: {
        //         files: ['src/**/*.*', '!src/less/**/*.*'],
        //         tasks: ['clean:src','copy:css', 'copy:js', 'concat:rpresenter', 'concat:vendors']
        //     },
        //     less: {
        //         files: 'src/less/**/*.less',
        //         tasks: ['recess:less']
        //     },
        //     demo: {
        //         files: 'test/**/*.less',
        //         tasks: ['recess:demo']
        //     }
        // }

    });

    // grunt.registerTask('build', function () {
    //     grunt.task.run.apply(grunt.task, []);
    // });
};