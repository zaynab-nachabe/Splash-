import {playerGameStat} from "./playerGameStat.model";

export type PlayerGameStatLinkModel = {
  player_id: number;
  game_id: number;
  player_stats: playerGameStat;
}
