module.exports = function (grunt) {
    // load plugins
    [
        'grunt-contrib-less',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-hashres',
    ].forEach(function (task) {
        grunt.loadNpmTasks(task);
    });

    // configure plugins
    grunt.initConfig({
        less: {
            development: {
                options: {
                    customFunctions: {
                        static: function (lessObject, name) {
                            const realUrl = require('./lib/static.js').map(name.value);
                            return `url("${realUrl}")`;
                        }
                    },
                },
                files: [{
                    expand: true,
                    cwd: 'less',
                    src: ['*.less'],
                    dest: 'public/css',
                    ext: '.css',
                }]
            }
        },
        uglify: {
            all: {
                files: {
                    'public/js/api.min.js': ['public/js/api.js'],
                    'public/js/main.min.js': ['public/js/main.js'],
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'public/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'public/css',
                    ext: '.min.css'
                }]
            },
        },
        hashres: {
            options: {
                fileNameFormat: '${name}.${hash}.${ext}',
                renameFiles: true
            },
            prod: {
                src: [
                    'public/js/main.min.js',
                    'public/js/api.min.js',
                    'public/css/main.min.css',
                    'public/css/api.min.css',
                ],
                dest: [
                    'views/layouts/main.hbs',
                    'views/api/index.hbs',
                ]
            },
        },
    });

    // register tasks
    // grunt.registerTask('default', ['cafemocha','jshint','exec', 'lint_pattern']);
    grunt.registerTask('css', ['less', 'cssmin']);
    grunt.registerTask('static', ['less', 'cssmin', 'uglify']);
};
