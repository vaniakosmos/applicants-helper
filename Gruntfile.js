module.exports = function(grunt){

    // load plugins
    [
        'grunt-contrib-less',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-hashres',
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    // configure plugins
    grunt.initConfig({
        less: {
            development: {
                options: {
                    customFunctions: {
                        static: function(lessObject, name) {
                            const realUrl = require('./lib/static.js').map(name.value);
                            return `url("${realUrl}")`;
                        }
                    }
                },
                files: {
                    'public/css/main.css': 'less/main.less',
                    'public/css/api.css': 'less/api.less',
                }
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
                files: {
                    'public/css/api.min.css': ['public/css/api.css'],
                    'public/css/main.min.css': ['public/css/main.css'],
                }
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
