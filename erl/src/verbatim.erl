-module(verbatim).
-author('chris@stackableregiments.com').

-include("../include/yaws_api.hrl").
-export([out/1]).

out(A) ->
    {ok,Contents} = file:read_file("/srv/yaws/data/logs/" ++ A#arg.appmoddata ++ "/tsung.log"),
    {content,"text/plain",Contents}.
