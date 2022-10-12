port module Main exposing (main)

import Browser
import Html exposing (Html)
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
    = End2End


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        End2End ->
            ( model, e2e () )


port e2e : () -> Cmd msg


view : Model -> Html Msg
view _ =
    Html.div
        []
        [ Html.button
            [ onClick End2End
            ]
            [ Html.text "Run"
            ]
        ]
