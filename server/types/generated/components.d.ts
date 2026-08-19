import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksGuestCategory extends Struct.ComponentSchema {
  collectionName: 'components_blocks_guest_categories';
  info: {
    displayName: 'Guest Category';
  };
  attributes: {
    defaultValue: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    key: Schema.Attribute.String;
    max: Schema.Attribute.Integer;
    min: Schema.Attribute.Integer;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_hero_sections';
  info: {
    displayName: 'HeroSection';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    dateLabel: Schema.Attribute.String;
    datePlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Add date'>;
    destinationLabel: Schema.Attribute.String;
    destinationPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Where are you going?'>;
    destinationSearchText: Schema.Attribute.String;
    guestMenu: Schema.Attribute.Component<'blocks.guest-category', true>;
    guestsLabel: Schema.Attribute.String;
    guestsPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Add guests'>;
    searchWithAiText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Search with AI'>;
    stats: Schema.Attribute.Component<'elements.stat-item', true>;
  };
}

export interface BlocksJourneySection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_journey_sections';
  info: {
    displayName: 'Journey Section';
  };
  attributes: {
    features: Schema.Attribute.Component<'elements.feature-item', true>;
    highlightedWord: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksTopPicksSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_top_picks_sections';
  info: {
    displayName: 'Top Picks Section';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    categories: Schema.Attribute.Component<'elements.category-card', true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsCategoryCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_category_cards';
  info: {
    displayName: 'Category Card';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_feature_items';
  info: {
    displayName: 'Feature Item';
  };
  attributes: {
    description: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsStatItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_stat_items';
  info: {
    displayName: 'StatItem';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    headerLinks: Schema.Attribute.Component<'menu.nav-link', true>;
    logo: Schema.Attribute.Media<'images'>;
  };
}

export interface MenuNavLink extends Struct.ComponentSchema {
  collectionName: 'components_menu_nav_links';
  info: {
    displayName: 'Nav Link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blocks.guest-category': BlocksGuestCategory;
      'blocks.hero-section': BlocksHeroSection;
      'blocks.journey-section': BlocksJourneySection;
      'blocks.top-picks-section': BlocksTopPicksSection;
      'elements.category-card': ElementsCategoryCard;
      'elements.feature-item': ElementsFeatureItem;
      'elements.stat-item': ElementsStatItem;
      'layout.header': LayoutHeader;
      'menu.nav-link': MenuNavLink;
    }
  }
}
