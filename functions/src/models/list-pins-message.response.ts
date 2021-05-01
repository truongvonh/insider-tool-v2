import { WebAPICallResult } from "@slack/web-api";

export interface IListPinMessages extends WebAPICallResult {
  ok: boolean;
  items: Item[];
}

export interface Item {
  type: string;
  created: number;
  created_by: string;
  channel: string;
  message: Message;
}

export interface Message {
  bot_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  team: string;
  bot_profile: BotProfile;
  pinned_to: string[];
}

export interface BotProfile {
  id: string;
  deleted: boolean;
  name: string;
  updated: number;
  app_id: string;
  icons: Icons;
  team_id: string;
}

export interface Icons {
  image_36: string;
  image_48: string;
  image_72: string;
}
