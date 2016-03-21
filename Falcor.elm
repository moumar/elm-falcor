module Falcor where

import Json.Encode as Json
import Task exposing (Task)
-- import Debug exposing (log)
import Native.Falcor
import String

type alias Model = Json.Value

type alias Options =
  { cache: Maybe Json.Value
  , url: Maybe String
  }

type Error = CommonError

type Path
  = PathList (List Path)
  -- | PathPrefixed (List Path) (List Path)
  | PathString String
  | PathStrings (List String)
  | Range Int Int

convertPath : List Path -> List Json.Value
convertPath paths =
  let _ = ""
  in
    List.map
    (\path ->
      case path of
        PathList lst ->
          Json.list <| convertPath lst
        PathString str ->
          Json.string str
        PathStrings arr ->
          Json.list <| List.map Json.string arr
        Range from to ->
          Json.object [ ("from", Json.string <| toString <| from), ("to", Json.string <| toString <| to) ]
    ) paths

{-
flattenPath : List Path -> List Path
flattenPath paths =
  List.map (\path -> 
    case path of
      PathPrefixed prefix lst ->
        List.map (\p -> PathList <| prefix ++ [ p ]) lst
      _ -> [ path ]
  ) paths
-}

createModel : Options -> Model
createModel = Native.Falcor.createModel

get : Model -> List Path -> Task err Json.Value
get model paths = Native.Falcor.get model (convertPath paths |> Json.list)

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

prependPath : List String -> List Path -> List Path -> List Path
prependPath prefix paths suffix =
  let
    basePath = List.map PathString prefix
  in
    List.map
        (\path ->
          PathList <| basePath ++ suffix ++ (
            case path of
              PathList arr -> arr
              _ -> [ path ]
            )
        ) paths

prefixPath : List Path -> List Path -> List Path
prefixPath prefix lst =
    List.map
    (\p ->
       PathList <| prefix ++
         -- [ p ]
         ( case p of
             PathList plist -> plist
             _ -> [p]
         )
    )
    lst

