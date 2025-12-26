import { build, context } from 'esbuild'
import * as sass from 'sass'
import { writeFileSync, watch, existsSync } from 'fs'
import { resolve } from 'path'

/**
 * Vite plugin to build WordPress theme assets (SASS and JavaScript)
 */
export function themeBuild() {
  const themePath = resolve(process.cwd(), 'wp-content/themes/botanicals')
  let esbuildContext = null
  let sassWatcher = null

  const buildThemeJS = async () => {
    try {
      const jsFile = resolve(themePath, 'assets/js/main.js')
      const bundleFile = resolve(themePath, 'assets/js/bundle.js')
      
      if (!existsSync(jsFile)) {
        console.error(`✗ JS file not found: ${jsFile}`)
        return
      }
      
      if (esbuildContext) {
        await esbuildContext.rebuild()
      } else {
        await build({
          entryPoints: [jsFile],
          bundle: true,
          format: 'iife',
          outfile: bundleFile,
          sourcemap: true,
          target: 'es2015',
          logLevel: 'silent'
        })
      }
      
      console.log(`✓ JS bundled: ${bundleFile}`)
    } catch (error) {
      console.error('✗ JS build error:', error.message)
      if (error.stack) {
        console.error(error.stack)
      }
    }
  }

  const buildThemeCSS = () => {
    try {
      const sassFile = resolve(themePath, 'assets/sass/style.scss')
      const cssFile = resolve(themePath, 'style.css')
      
      if (!existsSync(sassFile)) {
        console.error(`✗ SASS file not found: ${sassFile}`)
        return
      }
      
      const result = sass.compile(sassFile, {
        sourceMap: true,
        style: 'expanded',
        silenceDeprecations: ['import', 'slash-div']
      })
      
      writeFileSync(cssFile, result.css)
      
      if (result.sourceMap) {
        writeFileSync(
          resolve(themePath, 'style.css.map'),
          JSON.stringify(result.sourceMap)
        )
      }
      
      console.log(`✓ CSS compiled: ${cssFile}`)
    } catch (error) {
      console.error('✗ SASS compilation error:', error.message)
      if (error.stack) {
        console.error(error.stack)
      }
    }
  }

  return {
    name: 'theme-build',
    async buildStart() {
      // Build theme JavaScript
      await buildThemeJS()

      // Build theme SASS
      buildThemeCSS()
    },
    async buildEnd() {
      // Clean up watch contexts if they exist
      if (esbuildContext) {
        await esbuildContext.dispose()
        esbuildContext = null
      }
      if (sassWatcher) {
        sassWatcher.close()
        sassWatcher = null
      }
    },
    async configResolved() {
      // Build immediately when config is resolved (runs in both dev and build)
      try {
        await buildThemeJS()
        buildThemeCSS()
      } catch (error) {
        console.error('✗ Error building theme assets:', error.message)
        if (error.stack) {
          console.error(error.stack)
        }
      }
    },
    async configureServer(server) {
      // Watch mode - set up file watchers
      try {
        const jsFile = resolve(themePath, 'assets/js/main.js')
        const bundleFile = resolve(themePath, 'assets/js/bundle.js')
        
        if (!existsSync(jsFile)) {
          console.error(`✗ JS file not found for watch: ${jsFile}`)
          return
        }
        
        // Set up esbuild watch context
        esbuildContext = await context({
          entryPoints: [jsFile],
          bundle: true,
          format: 'iife',
          outfile: bundleFile,
          sourcemap: true,
          target: 'es2015',
          logLevel: 'silent'
        })
        await esbuildContext.watch()

        // Set up SASS watcher
        const sassDir = resolve(themePath, 'assets/sass')
        if (existsSync(sassDir)) {
          sassWatcher = watch(
            sassDir,
            { recursive: true },
            () => {
              buildThemeCSS()
            }
          )
          console.log('✓ Theme asset watchers initialized')
        } else {
          console.error(`✗ SASS directory not found: ${sassDir}`)
        }
      } catch (error) {
        console.error('✗ Error setting up theme watch:', error.message)
        if (error.stack) {
          console.error(error.stack)
        }
      }
    }
  }
}

