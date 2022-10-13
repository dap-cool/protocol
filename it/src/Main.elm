port module Main exposing (main)

import Browser
import Html exposing (Html)
import Html.Attributes exposing (id, multiple, type_)
import Html.Events exposing (onClick)


main : Program () Model Msg
main =
    Browser.element
        { init = \_ -> ( { state = Home }, Cmd.none )
        , view = view
        , update = update
        , subscriptions = \_ -> Sub.none
        }


type alias Model =
    { state : State
    }


type State
    = Home


type Msg
    = Init
    | End2End


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Init ->
            ( model, init () )

        End2End ->
            ( model, e2e () )


port e2e : () -> Cmd msg


port init : () -> Cmd msg


view : Model -> Html Msg
view _ =
    Html.div
        []
        [ Html.button
            [ onClick Init
            ]
            [ Html.text "init"
            ]
        , Html.div
            []
            [ Html.form
                []
                [ Html.input
                    [ id "gg-sd-zip"
                    , type_ "file"
                    , multiple True
                    ]
                    []
                ]
            , Html.button
                [ onClick End2End
                ]
                [ Html.text "run e2e"
                ]
            ]
        ]
