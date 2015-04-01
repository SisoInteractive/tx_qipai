// develop path: "./"
// build path:  "dist"

// task order
//- Clean dist directory
//- Copy files to dist directory expect *.css files
//- Compile less, sass, coffee script into dist directory
//- Auto prefixer CSS in dist directory
//- Concat and compressor js to be single file in dist directory
//- Injector css and js file to html

//    grunt.registerTask('deploy', ['cleanDir', 'copyFileToDist', 'compileLess', 'autoPrefixCss', 'concatCompressorCss', 'concatJs', 'injectFileToHtml']);


module.exports = function (grunt){
    // auto-load npm task components
    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('./package.json'),

        // clean directory
        clean: {
            build: ["dist"]
        },

        // copy file to dist directory
        copy: {
            build: {
                files: [
                    {
                        src: ['assets/stylesheets/*.css', '*.html'],
                        dest: 'dist/',
                        expand: true
                    }
                ]
            }
        },

        // less compiler
        less: {
            build: {
                expand: true,
                cwd: 'assets/stylesheets/',
                src: ['*.less'],
                dest: 'dist/assets/stylesheets',
                ext: '.css'
            }
        },

        // concat and compressor css
        cssmin: {
            build: {
                files: {
                    'dist/assets/stylesheets/main.min.css': ['dist/assets/stylesheets/*.css']
                }
            }
        },

        autoprefixer: {
            options: {
                // Task-specific options go here.
            },
            build: {
                // Target-specific file lists and/or options go here.
                expand: true,
                flatten: true,
                src: 'dist/assets/stylesheets/*.css',
                dest: 'dist/assets/stylesheets/'
            }
        },

        // concat files
        concat: {
            build: {
                //src:'assets/scripts/*.js',
                //dest:'dist/assets/scripts/index.js'
            }
        },

        // compressor js
        // uglify可以将src定义的多个js files合成一个js file, 但这种合并顺序我们无法控制, 所以关于合并js文件的步骤需要手动去做
        uglify: {
            build: {
                //src:['assets/scripts/*.js', '!assets/scripts/less.min.js', '!assets/scripts/jquery-2.1.3.min.js'],
                //dest:'dist/assets/scripts/main.min.js'
            }
        },

        // injector js and css files to html
        injector: {
            options: {
                // Task-specific options go here.
            },
            css: {
                options: {
                    relative: true,
                    transform: function (filePath){
                        var filePath = filePath.replace('/dist/', '');
                        return '<link rel="stylesheet" href="' + filePath + '" />';
                    },
                    starttag: '<!-- injector:css -->',
                    endtag: '<!-- endinjector -->',
                },
                files: {
                    'dist/index.html': ['dist/assets/stylesheets/*.css']
                }
            },
            scripts: {
                options: {
                    relative: true,
                    transform: function (filePath){
                        var filePath = filePath.replace('/dist/', '');
                        return '<script src="' + filePath + '"></script>';
                    },
                    starttag: '<!-- injector:js -->',
                    endtag: '<!-- endinjector -->'
                },
                files: {
                    'dist/index.html': ['dist/assets/scripts/*.js']
                }
            }
        },

        watch: {
            css: {
                files: 'assets/stylesheets/**',
                options: {
                    livereload: true
                }
            },
            js: {
                files: 'assets/script/**',
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['*.html', '**/*.html', '**/**/*.html'],
                options: {
                    livereload: true
                }
            }
        }
    });

    // define task
    grunt.registerTask('cleanDir', ['clean:build']); //ok
    grunt.registerTask('copyFileToDist', ['copy:build']); //ok
    grunt.registerTask('compileLess', ['less:build']); //ok
    grunt.registerTask('autoPrefixCss', ['autoprefixer:build']);
    grunt.registerTask('concatCompressorCss', ['cssmin:build']); //ok
    grunt.registerTask('concatJs', ['uglify:build']); //ok
    grunt.registerTask('injectFileToHtml', ['injector']); //ok
    // main task
    //grunt.registerTask('deploy', ['cleanDir', 'copyFileToDist', 'compileLess', 'autoPrefixCss', 'concatCompressorCss', 'concatJs', 'injectFileToHtml']);
    grunt.registerTask('deploy', ['cleanDir', 'copyFileToDist', 'compileLess', 'autoPrefixCss', 'concatCompressorCss', 'concatJs']);
    grunt.registerTask('live', ['watch']);


};