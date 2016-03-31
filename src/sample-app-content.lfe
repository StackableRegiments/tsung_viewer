(defmodule sample-app-content
  (export all))

(include-file "deps/exemplar/include/html-macros.lfe")

(defun base-page (title remaining)
  "A function to provide the base for all pages."
  (list
   (!doctype 'html)
   (html '(lang "en")
         (list
          (head
           (list
            (title title)
            (link '(rel "stylesheet" href "/css/bootstrap-min.css"))
            (link '(rel "stylesheet" href "/css/bootstrap-slate-min.css"))
            (script '(src "/js/bootstrap-min.js"))
            (script '(src "/js/bootstrap-min.js"))))
          (body
           )))))

(defun four-oh-four (message)
  "Custom 404 page."
  (lfest-html-resp:not-found
   (base-page
    "404"
    (div
     (list
      (h1 "404 - Not Found")
      (div (p message)))))))
