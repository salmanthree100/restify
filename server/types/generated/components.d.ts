import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksExploreWorld extends Struct.ComponentSchema {
  collectionName: 'components_blocks_explore_worlds';
  info: {
    displayName: 'Explore World';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.RichText;
    endTitle: Schema.Attribute.String;
    heroImage: Schema.Attribute.Media<'images'>;
    highlightTitle: Schema.Attribute.String;
    mainTitle: Schema.Attribute.String;
    stats: Schema.Attribute.Component<'elements.stat-badge', true>;
  };
}

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

export interface BlocksGuestStoriesSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_guest_stories_sections';
  info: {
    displayName: 'Guest Stories Section';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    highlightTitle: Schema.Attribute.String;
    mainTitle: Schema.Attribute.String;
    mapBackground: Schema.Attribute.Media<'images'>;
    stories: Schema.Attribute.Component<'elements.guest-story', true>;
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

export interface BlocksNewsletterSection extends Struct.ComponentSchema {
  collectionName: 'components_blocks_newsletter_sections';
  info: {
    displayName: 'Newsletter Section';
  };
  attributes: {
    buttonText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    placeholderText: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksServicesOffer extends Struct.ComponentSchema {
  collectionName: 'components_blocks_services_offers';
  info: {
    displayName: 'Services Offer';
  };
  attributes: {
    endTitle: Schema.Attribute.String;
    features: Schema.Attribute.Component<'elements.service-feature', true>;
    highlightTitle: Schema.Attribute.String;
    mainTitle: Schema.Attribute.String;
    sideImage: Schema.Attribute.Media<'images'>;
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

export interface BlocksTrendingLocations extends Struct.ComponentSchema {
  collectionName: 'components_blocks_trending_locations';
  info: {
    displayName: 'Trending Locations';
  };
  attributes: {
    highlightTitle: Schema.Attribute.String;
    locations: Schema.Attribute.Relation<'oneToMany', 'api::property.property'>;
    mainTitle: Schema.Attribute.String;
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

export interface ElementsGuestStory extends Struct.ComponentSchema {
  collectionName: 'components_elements_guest_stories';
  info: {
    displayName: 'Guest Story';
  };
  attributes: {
    age: Schema.Attribute.Integer;
    ageText: Schema.Attribute.String;
    avatar: Schema.Attribute.Media<'images'>;
    country: Schema.Attribute.String;
    name: Schema.Attribute.String;
    positionX: Schema.Attribute.Decimal;
    positionY: Schema.Attribute.Decimal;
    quote: Schema.Attribute.Text;
  };
}

export interface ElementsServiceFeature extends Struct.ComponentSchema {
  collectionName: 'components_elements_service_features';
  info: {
    displayName: 'Service Feature';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_social_links';
  info: {
    displayName: 'Social Link';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      ['facebook', 'twitter', 'linkedin', 'instagram']
    >;
    url: Schema.Attribute.String;
  };
}

export interface ElementsStatBadge extends Struct.ComponentSchema {
  collectionName: 'components_elements_stat_badges';
  info: {
    displayName: 'Stat Badge';
  };
  attributes: {
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
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

export interface LayoutFooter extends Struct.ComponentSchema {
  collectionName: 'components_layout_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    columns: Schema.Attribute.Component<'menu.footer-column', true>;
    copyrightText: Schema.Attribute.String;
    newsletter: Schema.Attribute.Component<'blocks.newsletter-section', false>;
    socialLinks: Schema.Attribute.Component<'elements.social-link', true>;
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

export interface MenuFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_menu_footer_columns';
  info: {
    displayName: 'Footer Column';
  };
  attributes: {
    links: Schema.Attribute.Component<'menu.nav-link', true>;
    title: Schema.Attribute.String;
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
      'blocks.explore-world': BlocksExploreWorld;
      'blocks.guest-category': BlocksGuestCategory;
      'blocks.guest-stories-section': BlocksGuestStoriesSection;
      'blocks.hero-section': BlocksHeroSection;
      'blocks.journey-section': BlocksJourneySection;
      'blocks.newsletter-section': BlocksNewsletterSection;
      'blocks.services-offer': BlocksServicesOffer;
      'blocks.top-picks-section': BlocksTopPicksSection;
      'blocks.trending-locations': BlocksTrendingLocations;
      'elements.category-card': ElementsCategoryCard;
      'elements.feature-item': ElementsFeatureItem;
      'elements.guest-story': ElementsGuestStory;
      'elements.service-feature': ElementsServiceFeature;
      'elements.social-link': ElementsSocialLink;
      'elements.stat-badge': ElementsStatBadge;
      'elements.stat-item': ElementsStatItem;
      'layout.footer': LayoutFooter;
      'layout.header': LayoutHeader;
      'menu.footer-column': MenuFooterColumn;
      'menu.nav-link': MenuNavLink;
    }
  }
}
