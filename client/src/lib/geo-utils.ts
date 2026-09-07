// lib/geo-utils.ts

export interface BoundingBox {
   minLat: number;
   maxLat: number;
   minLng: number;
   maxLng: number;
}

/**
 * Calculates a bounding box (min/max lat & lng) for a given center point and radius in kilometers.
 */
export function getBoundingBox(
   lat: number,
   lng: number,
   radiusInKm: number = 25,
): BoundingBox {
   const earthRadiusKm = 6371;

   // Angular distance in radians
   const radDist = radiusInKm / earthRadiusKm;

   const radLat = (lat * Math.PI) / 180;
   const radLng = (lng * Math.PI) / 180;

   const minLat = radLat - radDist;
   const maxLat = radLat + radDist;

   //    let minLng: number;
   //    let maxLng: number;

   const deltaLng = Math.asin(Math.sin(radDist) / Math.cos(radLat));
   const minLng: number = radLng - deltaLng;
   const maxLng: number = radLng + deltaLng;

   return {
      minLat: (minLat * 180) / Math.PI,
      maxLat: (maxLat * 180) / Math.PI,
      minLng: (minLng * 180) / Math.PI,
      maxLng: (maxLng * 180) / Math.PI,
   };
}
