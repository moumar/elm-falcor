module Falcor where

import Json.Decode as Json
import Task exposing (Task)
import Native.Falcor

get : List String -> Task err Json.Value
get = Native.Falcor.get
