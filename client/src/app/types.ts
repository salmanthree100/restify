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

export interface StrapiCurrency {
   name: string;
   code?: string;
   symbol: string;
   exchangeRateToUSD?: number;
   currencyCode: string;
}

export interface LanguageItem {
   code: string;
   name: string;
   region: string;
   flag: string;
}

export interface StatItem {
   id: number;
   value: string;
   label: string;
}

export interface HeroSectionData {
   backgroundImage?: StrapiMedia;
   searchWithAiText?: string;
   destinationPlaceholder?: string;
   datePlaceholder?: string;
   guestsPlaceholder?: string;
   stats?: StatItem[];
   destinationSearchText: string;
   destinationLabel: string;
   dateLabel: string;
   guestsLabel: string;
}

// footer data types
export interface NavLinkItem {
   id: number;
   label: string;
   url: string;
}

export interface FooterColumn {
   id: number;
   title: string;
   links: NavLinkItem[];
}

export interface SocialLink {
   id: number;
   platform: "facebook" | "twitter" | "linkedin" | "instagram";
   url: string;
}

export interface NewsletterSection {
   title: string;
   description: string;
   placeholderText: string;
   buttonText: string;
}

export interface FooterData {
   columns: FooterColumn[];
   newsletter: NewsletterSection;
   socialLinks: SocialLink[];
   copyrightText: string;
}
