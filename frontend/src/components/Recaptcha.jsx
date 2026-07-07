import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Loads the Google reCAPTCHA v2 API script exactly once and resolves when
// window.grecaptcha is ready to render widgets.
const SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit'
let scriptPromise = null

function loadRecaptcha() {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (window.grecaptcha && window.grecaptcha.render) {
      resolve(window.grecaptcha)
      return
    }

    const finish = () => {
      // grecaptcha.render becomes available slightly after the script's onload.
      const ready = () => {
        if (window.grecaptcha && window.grecaptcha.render) {
          resolve(window.grecaptcha)
        } else {
          setTimeout(ready, 50)
        }
      }
      ready()
    }

    let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = finish
      script.onerror = () => reject(new Error('reCAPTCHA script load failed'))
      document.head.appendChild(script)
    } else {
      script.addEventListener('load', finish)
      script.addEventListener('error', () =>
        reject(new Error('reCAPTCHA script load failed')),
      )
      finish()
    }
  })

  return scriptPromise
}

/**
 * Google reCAPTCHA v2 checkbox.
 *
 * Props:
 *   siteKey  – the reCAPTCHA v2 site key
 *   onChange – called with the response token (string) when solved,
 *              and with '' when the challenge expires or errors.
 *
 * Ref API:
 *   reset()  – clears the widget so the user can solve it again.
 */
const Recaptcha = forwardRef(function Recaptcha({ siteKey, onChange }, ref) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current)
        } catch {
          // widget may not be rendered yet; nothing to reset
        }
      }
    },
  }))

  useEffect(() => {
    let cancelled = false
    if (!siteKey) return undefined

    loadRecaptcha()
      .then((grecaptcha) => {
        // Guard against StrictMode double-mount / re-render into a filled node.
        if (cancelled || !containerRef.current) return
        if (widgetIdRef.current !== null || containerRef.current.childNodes.length) {
          return
        }
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onChangeRef.current?.(token),
          'expired-callback': () => onChangeRef.current?.(''),
          'error-callback': () => onChangeRef.current?.(''),
        })
      })
      .catch(() => {
        if (!cancelled) onChangeRef.current?.('')
      })

    return () => {
      cancelled = true
    }
  }, [siteKey])

  return <div ref={containerRef} />
})

export default Recaptcha
