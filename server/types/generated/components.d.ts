import type { Schema, Struct } from '@strapi/strapi';

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
      'layout.header': LayoutHeader;
      'menu.nav-link': MenuNavLink;
    }
  }
}
