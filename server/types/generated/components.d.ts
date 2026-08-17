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
      'elements.stat-item': ElementsStatItem;
      'layout.header': LayoutHeader;
      'menu.nav-link': MenuNavLink;
    }
  }
}
