import { WebAPICallResult } from "@slack/web-api";

export interface ISearchMessageResponse extends WebAPICallResult {
  ok: boolean;
  query: string;
  messages: Messages;
}

export interface Messages {
  total: number;
  pagination: Pagination;
  paging: Paging;
  matches: Match[];
}

export interface Match {
  iid: string;
  team: string;
  score: number;
  channel: Channel;
  type: string;
  user: string;
  username: string;
  ts: string;
  blocks: Block[];
  text: string;
  permalink: string;
  no_reactions: boolean;
}

export interface Block {
  type: string;
  block_id: string;
  elements: BlockElement[];
}

export interface BlockElement {
  type: string;
  elements: ElementElementClass[];
}

export interface ElementElementClass {
  type: string;
  text: string;
}

export interface Channel {
  id: string;
  name: string;
  user: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_shared: boolean;
  is_org_shared: boolean;
  is_ext_shared: boolean;
}

export interface Pagination {
  total_count: number;
  page: number;
  per_page: number;
  page_count: number;
  first: number;
  last: number;
}

export interface Paging {
  count: number;
  total: number;
  page: number;
  pages: number;
}
