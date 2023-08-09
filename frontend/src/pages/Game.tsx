import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {GameDistribution, Player} from "../utils/types.ts";
import {useGame} from "../hooks/useGame.ts";
import {profilePicture} from "../utils/functions.ts";
import {useEffect, useState} from "react";
import styled from "@emotion/styled";
import SurrenderMoodle from "../components/game/SurrenderMoodle.tsx";
import deckBack from "../assets/deckBack.png";
import eggBack from "../assets/eggBack.jpg";
import mySecurityStack from "../assets/mySecurityStack.png";
import opponentSecurityStack from "../assets/opponentSecurityStack.png";
import Card from "../components/Card.tsx";
import cardBack from "../assets/cardBack.jpg";
import CardDetails from "../components/CardDetails.tsx";

export default function Game({user}: { user: string }) {

    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/game" : "wss://cgn-java-23-2-enrico.capstone-project.de/api/ws/chat";
    const navigate = useNavigate();

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const gameId = useStore((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);
    const distributeCards = useGame((state) => state.distributeCards);

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const opponentName = useGame((state) => state.opponentName);

    const [surrenderOpen, setSurrenderOpen] = useState<boolean>(false);
    const [timerOpen, setTimerOpen] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(5);
    const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

    const memory = useGame((state) => state.memory);
    const myHand = useGame((state) => state.myHand);
    const myDeckField = useGame((state) => state.myDeckField);
    const myEggDeck = useGame((state) => state.myEggDeck);
    const myTrash = useGame((state) => state.myTrash);
    const mySecurity = useGame((state) => state.mySecurity);
    const myTamer = useGame((state) => state.myTamer);
    const myDelay = useGame((state) => state.myDelay);

    const myDigi1 = useGame((state) => state.myDigi1);
    const myDigi2 = useGame((state) => state.myDigi2);
    const myDigi3 = useGame((state) => state.myDigi3);
    const myDigi4 = useGame((state) => state.myDigi4);
    const myDigi5 = useGame((state) => state.myDigi5);
    const myBreedingArea = useGame((state) => state.myBreedingArea);

    const opponentHand = useGame((state) => state.opponentHand);
    const opponentDeckField = useGame((state) => state.opponentDeckField);
    const opponentEggDeck = useGame((state) => state.opponentEggDeck);
    const opponentTrash = useGame((state) => state.opponentTrash);
    const opponentSecurity = useGame((state) => state.opponentSecurity);
    const opponentTamer = useGame((state) => state.opponentTamer);
    const opponentDelay = useGame((state) => state.opponentDelay);

    const opponentDigi1 = useGame((state) => state.opponentDigi1);
    const opponentDigi2 = useGame((state) => state.opponentDigi2);
    const opponentDigi3 = useGame((state) => state.opponentDigi3);
    const opponentDigi4 = useGame((state) => state.opponentDigi4);
    const opponentDigi5 = useGame((state) => state.opponentDigi5);
    const opponentBreedingArea = useGame((state) => state.opponentBreedingArea);

    const websocket = useWebSocket(websocketURL, {

        onOpen: () => {
            websocket.sendMessage("/startGame:" + gameId);
        },

        onMessage: (event) => {

            if (event.data.startsWith("[START_GAME]:")) {
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                const me = players.filter((player: Player) => player.username === user)[0];
                const opponent = players.filter((player: Player) => player.username !== user)[0];
                setUpGame(me, opponent);
            }

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const newGame: GameDistribution = JSON.parse(event.data.substring("[DISTRIBUTE_CARDS]:".length));
                distributeCards(user, newGame, gameId);
            }

            (event.data === "[SURRENDER]") && startTimer();

            if (event.data === "[PLAYER_LEFT]") {
                setOpponentLeft(true);
                startTimer();
            }
        }
    });

    useEffect(() => {
        if (timer === 0) navigate("/lobby");
    }, [timer, navigate]);

    function handleSurrender() {
        websocket.sendMessage(`${gameId}:/surrender:${opponentName}`);
        startTimer();
    }

    function startTimer() {
        setTimerOpen(true);
        for (let i = 5; i > 0; i--) {
            setTimeout(() => {
                setTimer((timer) => timer - 1);
            }, i * 1000);
        }
    }

    return (
        <>
            {(surrenderOpen || timerOpen) &&
                <SurrenderMoodle timer={timer} timerOpen={timerOpen} surrenderOpen={surrenderOpen}
                                 setSurrenderOpen={setSurrenderOpen} opponentLeft={opponentLeft}
                                 handleSurrender={handleSurrender}/>}

            <Wrapper>
                <InfoContainer>
                    <InfoSpan>
                        <a href="https://world.digimoncard.com/rule/pdf/manual.pdf?070723" target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color:"dodgerblue"}}>🛈 </span>Manual
                        </a>
                        <a href="https://world.digimoncard.com/rule/pdf/general_rules.pdf" target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color:"dodgerblue"}}>🛈 </span>Rulings
                        </a>
                    </InfoSpan>
                    <CardImage src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                               alt={selectedCard?.name ?? "Card"}/>
                    <CardDetails/>
                </InfoContainer>

                <FieldContainer>
                    <div style={{display: "flex"}}>
                        <OpponentContainerMain>

                            <PlayerContainer>
                                <img alt="opponent" src={profilePicture(opponentAvatar)}
                                     style={{width: "160px", border: "#0c0c0c solid 2px"}}/>
                                <UserName>{opponentName}</UserName>
                            </PlayerContainer>

                            <OpponentDeckContainer>
                                <img alt="deck" src={deckBack} width="105px"/>
                            </OpponentDeckContainer>

                            <OpponentTrashContainer>
                                {opponentTrash.length === 0 && <TrashPlaceholder>Trash</TrashPlaceholder>}
                            </OpponentTrashContainer>

                            <BattleArea1></BattleArea1>
                            <BattleArea2></BattleArea2>
                            <BattleArea3></BattleArea3>
                            <BattleArea4></BattleArea4>
                            <BattleArea5></BattleArea5>

                            <DelayAreaContainer style={{marginTop: "1px"}}>
                                {opponentDelay.length === 0 && <span>Delay</span>}
                            </DelayAreaContainer>

                            <TamerAreaContainer>
                                {opponentTamer.length === 0 && <span>Tamers</span>}
                            </TamerAreaContainer>

                            <OpponentHand>
                                {opponentHand.map((card) => <OppenentHandCard alt="card" key={card.id}
                                                                              src={cardBack}/>)}
                            </OpponentHand>

                        </OpponentContainerMain>

                        <OpponentContainerSide>
                            <EggDeckContainer>
                                {opponentEggDeck.length !== 0 && <img alt="egg-deck" src={eggBack} width="105px"/>}
                            </EggDeckContainer>

                            <SecurityStackContainer>
                                <OpponentSecuritySpan>{opponentSecurity.length}</OpponentSecuritySpan>
                                <img alt="security-stack" src={opponentSecurityStack}/>
                            </SecurityStackContainer>

                            <BreedingAreaContainer>
                                {opponentBreedingArea.length === 0 && <span>Breeding<br/>Area</span>}
                            </BreedingAreaContainer>

                        </OpponentContainerSide>
                    </div>

                    <EnergyBarContainer></EnergyBarContainer>

                    <div style={{display: "flex"}}>
                        <MyContainerSide>
                            <EggDeckContainer>
                                {myEggDeck.length !== 0 && <EggDeck alt="egg-deck" src={eggBack}/>}
                            </EggDeckContainer>

                            <SecurityStackContainer>
                                <MySecuritySpan>{mySecurity.length}</MySecuritySpan>
                                <img alt="security-stack" src={mySecurityStack}/>
                            </SecurityStackContainer>

                            <BreedingAreaContainer>
                                {myBreedingArea.length === 0 && <span>Breeding<br/>Area</span>}
                            </BreedingAreaContainer>
                        </MyContainerSide>

                        <MyContainerMain>

                            <PlayerContainer>
                                <UserName>{user}</UserName>
                                <PlayerImage alt="me" src={profilePicture(myAvatar)}
                                             onClick={() => setSurrenderOpen(!surrenderOpen)}/>
                            </PlayerContainer>

                            <DeckContainer>
                                <Deck alt="deck" src={deckBack}/>
                            </DeckContainer>

                            <TrashContainer>
                                {myTrash.length === 0 && <TrashPlaceholder>Trash</TrashPlaceholder>}
                            </TrashContainer>

                            <BattleArea1></BattleArea1>
                            <BattleArea2></BattleArea2>
                            <BattleArea3></BattleArea3>
                            <BattleArea4></BattleArea4>
                            <BattleArea5></BattleArea5>

                            <DelayAreaContainer style={{marginBottom: "1px"}}>
                                {myDelay.length === 0 && <span>Delay</span>}
                            </DelayAreaContainer>

                            <TamerAreaContainer>
                                {myTamer.length === 0 && <span>Tamers</span>}
                            </TamerAreaContainer>

                            <MyHand>
                                {myHand.map((card) => <Card key={card.id} card={card} location={"myHand"}/>)}
                            </MyHand>

                        </MyContainerMain>
                    </div>
                </FieldContainer>
            </Wrapper>
        </>
    );
}

const MyContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-template-rows: 1.2fr 1fr;
  grid-template-areas: "digi1 digi1 digi2 digi2 digi3 digi3 digi4 digi4 digi5 digi5 trash trash deck deck"
                        "delay delay tamer tamer tamer hand hand hand hand hand hand player player player";
`;

const OpponentContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-template-rows: 1fr 1.2fr;
  grid-template-areas: "player player player hand hand hand hand hand hand tamer tamer tamer delay delay"
                        "deck deck trash trash digi5 digi5 digi4 digi4 digi3 digi3 digi2 digi2 digi1 digi1";
`;

const MyContainerSide = styled.div`
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1.5fr;
  grid-template-areas: "security-stack security-stack"
                        "egg-deck breed";
`;

const OpponentContainerSide = styled.div`
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1.5fr 1fr;
  grid-template-areas: "breed egg-deck"
                        "security-stack security-stack";
`;

const EnergyBarContainer = styled.div`
  height: 100px;
  width: 1005px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InfoContainer = styled.div`
  height: 1000px;
  width: 310px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  height: 1000px;
  width: 1600px;
  display: flex;
  background: rgba(47, 45, 45, 0.45);
  border-radius: 15px;

  @media (max-height: 1199px) {
    transform: scale(1);
  }

  @media (max-height: 1080px) {
    transform: scale(0.9);
  }
  @media (max-height: 900px) {
    transform: scale(0.7);
  }

  @media (min-height: 1200px) {
    transform: scale(1.5);
  }
`;

// Player

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: player;
  align-items: center;
  justify-content: center;
`;

const PlayerImage = styled.img`
  cursor: pointer;
  width: 160px;
  border: #0c0c0c solid 2px;
  transition: all 0.1s ease;

  &:hover {
    filter: drop-shadow(0 0 2px #eceaea);
    border: #eceaea solid 2px;
  }
`;

const UserName = styled.span`
  font-size: 20px;
  align-self: flex-start;
  margin-left: 27px;
  font-family: 'Cousine', sans-serif;
`;

// Fields

const DeckContainer = styled.div`
  grid-area: deck;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 0 0 10px 10px;
`;

const OpponentDeckContainer = styled.div`
  grid-area: deck;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px 10px 0 0;
`;

const Deck = styled.img`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    filter: drop-shadow(0 0 1px #eceaea);
  }
`;

const EggDeck = styled(Deck)`
  &:hover {
    filter: drop-shadow(0 0 3px #dd33e8);
    outline: #dd33e8 solid 1px;
  }
`;

const TrashContainer = styled.div`
  grid-area: trash;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px 10px 0 0;
`;

const OpponentTrashContainer = styled.div`
  grid-area: trash;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 0 0 10px 10px;
`;

const EggDeckContainer = styled.div`
  grid-area: egg-deck;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0 10px 10px;
`;

const SecurityStackContainer = styled.div`
  cursor: pointer;
  position: relative;
  grid-area: security-stack;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MySecuritySpan = styled.span`
  position: absolute;
  z-index: 5;
  font-family: Awsumsans, sans-serif;
  font-size: 35px;
  color: #0c0c0c;
  text-shadow: #0e6cc7 1px 1px 1px;
  left: 175px;
`;

const OpponentSecuritySpan = styled(MySecuritySpan)`
  text-shadow: #c70e3f 1px 1px 1px;
  left: 90px;
`;

const BattleAreaContainer = styled.div`
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  outline: rgba(255, 255, 255, 0.5) solid 1px;
`;

const BattleArea1 = styled(BattleAreaContainer)`
  grid-area: digi1;`;

const BattleArea2 = styled(BattleAreaContainer)`
  grid-area: digi2;`;

const BattleArea3 = styled(BattleAreaContainer)`
  grid-area: digi3;`;

const BattleArea4 = styled(BattleAreaContainer)`
  grid-area: digi4;`;

const BattleArea5 = styled(BattleAreaContainer)`
  grid-area: digi5;`;

const BreedingAreaContainer = styled(BattleAreaContainer)`
  margin: 1px;
  grid-area: breed;
`;

const DelayAreaContainer = styled(BattleAreaContainer)`
  grid-area: delay;
`;

const TamerAreaContainer = styled(BattleAreaContainer)`
  margin: 1px 0 1px 0;
  grid-area: tamer;
  flex-direction: row;
`;

const MyHand = styled.div`
  grid-area: hand;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: scroll;
`;

const OpponentHand = styled.div`
  grid-area: hand;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: scroll;
`;

const OppenentHandCard = styled.img`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
`;

export const CardImage = styled.img`
  width: 307px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
  outline: #0c0c0c solid 1px;
  transform: translateY(2px);
`;

const InfoSpan = styled.span`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  font-family: Cuisine, sans-serif;
  font-size: 24px;

  a {
    color: ghostwhite;

    &:hover {
      color: dodgerblue;
    }
  }
`;

const TrashPlaceholder = styled.div`
  width: 105px;
  height: 146px;
  border-radius: 5px;
  border: #0c0c0c solid 2px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;
