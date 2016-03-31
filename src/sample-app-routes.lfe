(defmodule sample-app-routes
  (export all))

(include-file "deps/exemplar/include/html-macros.lfe")
(include-file "deps/lfest/include/lfest-routes.lfe")

(defroutes
  ('GET "/"
        (sample-app-content:get-sidebar-content arg-data))
  ('NOTFOUND
   (let* ((joined-path (++ "/" (string:join path "/")))
          (msg (++ "Unmatched route!~n~n"
                   "Path-info: ~p~n"
                   "joined path: ~p~n"
                   "arg-data: ~p~n~n"))
          (msg-args `(,path ,joined-path ,arg-data)))
     (io:format msg msg-args)
     (sample-app-content:four-oh-four
      (++ (strong "Unmatched Route: ") joined-path)))))
