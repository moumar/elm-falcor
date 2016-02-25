module Falcor where

import Json.Decode as Json
import Task exposing (Task)
import Native.Falcor

type alias Model = Json.Value

createModel : String -> Model
createModel = Native.Falcor.createModel


get : Model -> List String -> Task err Json.Value
get = Native.Falcor.get
