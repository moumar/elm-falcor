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

type Error = CommonError

createModel : Options -> Model
createModel = Native.Falcor.createModel


get : Model -> List String -> Task err Json.Value
get = Native.Falcor.get

setValue : Model -> String -> String -> Task err ()
setValue = Native.Falcor.setValue

call : Model -> String -> List String -> Task err ()
call = Native.Falcor.call


hashToList : List (String, a) -> List a
hashToList lst =
  List.sortBy
    (fst >> String.toInt >> Result.withDefault -1)
    lst
  |> List.map snd

{-
load : (List String) -> Json.Decoder a -> Task Error a
load falcorQuery decoder =
  Falcor.get falcorModel falcorQuery |> Task.map (Json.decodeValue decoder)
-}
