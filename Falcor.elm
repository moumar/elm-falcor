module Falcor where

import Json.Decode as Json
import Task exposing (Task)
import Native.Falcor
import String

type alias Model = Json.Value

type alias Options =
  { cache: Maybe Json.Value
  , url: Maybe String
  }

createModel : Options -> Model
createModel = Native.Falcor.createModel


get : Model -> List String -> Task err Json.Value
get = Native.Falcor.get

hashToList : List (String, a) -> List a
hashToList lst =
  List.sortBy
    (fst >> String.toInt >> Result.withDefault -1)
    lst
  |> List.map snd


