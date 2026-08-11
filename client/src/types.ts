export interface StrapiMedia {
   url: string;
   width?: number;
   height?: number;
   name?: string;
   alternativeText?: string;
}

export interface HeaderLink {
   id: number;
   label: string;
   url: string;
}

export interface HeaderData {
   logo?: StrapiMedia;
   headerLinks?: HeaderLink[];
}
