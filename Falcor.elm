module Falcor where

import Json.Encode
import Task exposing (Task)
import Effects exposing (Never)
-- import Debug exposing (log)
import String
import Json.Decode as Json exposing ((:=))
import Native.Falcor

type alias Model = Json.Value

type alias Options =
  { cache: Maybe Json.Value
  , url: Maybe String
  }

type Error = CommonError

type Path
  = PathList (List Path)
  | PathString String
  | PathStrings (List String)
  | Range Int Int

convertPaths : List Path -> List Json.Encode.Value
convertPaths paths =
  let _ = ""
  in
    List.map
    (\path ->
      case path of
        PathList lst ->
          Json.Encode.list <| convertPaths lst
        PathString str ->
          Json.Encode.string str
        PathStrings arr ->
          Json.Encode.list <| List.map Json.Encode.string arr
        Range from to ->
          Json.Encode.object [ ("from", Json.Encode.string <| toString <| from), ("to", Json.Encode.string <| toString <| to) ]
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
get model paths = Native.Falcor.get model (convertPaths paths |> Json.Encode.list)

setValue : Model -> List String -> String -> Task err ()
setValue model path value = Native.Falcor.setValue model (listToJs path) value

call : Model -> List String -> List String -> Task err ()
call model path value = Native.Falcor.call model (listToJs path) (listToJs value)

hashToList : List (String, a) -> List a
hashToList lst =
  List.sortBy
    (fst >> String.toInt >> Result.withDefault -1)
    lst
  |> List.map snd

listToJs : List String -> Json.Value
listToJs = List.map Json.Encode.string >> Json.Encode.list

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


listDecoder : Json.Decoder a -> Json.Decoder (List a)
listDecoder decoder =
  Json.oneOf
    [ Json.keyValuePairs decoder |> Json.map hashToList
    , Json.succeed []
    ]

load : Model -> List String -> List Path -> Json.Decoder a -> Task Never (Result String a)
load falcorModel prefix paths decoder =
  get
    falcorModel
    (prependPath prefix paths [])
  |> Task.toResult
  |> Task.map
    (\resultJsonVal ->
      Result.andThen
        resultJsonVal
        (\v -> Json.decodeValue (Json.at prefix decoder) v)
    )

loadCollection : Model -> List String -> List Path -> Json.Decoder a -> Int -> Int -> Task Never (List a)
loadCollection falcorModel prefix paths decoder from to =
    get
      falcorModel
      (prependPath prefix paths [ Range from to ])
    |> Task.toMaybe
    |> Task.map
         (\maybeJsonVal ->
            Maybe.andThen
              maybeJsonVal
              (\v ->
                 Result.toMaybe <|
                   Json.decodeValue
                   (Json.at prefix (listDecoder decoder))
              v
        ) |> Maybe.withDefault []
      )

loadCollection2 : Model -> List String -> List Path -> Json.Decoder a -> Json.Decoder b -> Int -> Int -> Task Never (List (a, b))
loadCollection2 falcorModel prefix paths decoder1 decoder2 from to =
    get
      falcorModel
      (prependPath prefix paths [ Range from to ])
    |> Task.toResult
    |> Task.map
      (\resultJsonVal ->
        Result.andThen
          resultJsonVal
          (\v ->
            let
              dec decoder =
                Json.decodeValue
                  (Json.at prefix (Json.keyValuePairs decoder |> Json.map hashToList))
                  v
            in
              Result.map2 (,) (dec decoder1) (dec decoder2)
              |> Result.map (\(lst1, lst2) -> List.map2 (,) lst1 lst2)
          )
          |> Result.toMaybe |> Maybe.withDefault []
      )
