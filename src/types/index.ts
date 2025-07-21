import type { antennaOptions, colorOptions, headOptions } from "../constants/options";

export type AntennaID = typeof antennaOptions[number]["id"];
export type HeadID = typeof headOptions[number]["id"];
export type ColorID = typeof colorOptions[number]["id"];

export type LabelEntry = {
    name: string;
    antenna: AntennaID | "";
    head: HeadID | "";
    color: ColorID | "";
    hp: number | "";
    evasion: number | "";
    notes: string;
};

export type QRData = {
    id: string;
    value: string;
    label: LabelEntry[];
    uid?: string;
};