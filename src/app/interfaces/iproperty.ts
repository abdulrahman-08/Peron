export interface IProperty {

    propertyId: any;
    title: string;
    location: string;
    price: number;
    rentType: string;
    area: number;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    isFurnished: boolean;
    hasBalcony: boolean;
    hasInternet: boolean;
    hasSecurity: boolean;
    hasElevator: boolean;
    allowsPets: boolean;
    smokingAllowed: boolean;
    availableFrom: string;
    availableTo: string;
    minBookingDays: number;
    averageRating: number;
    description: string;
    images: string[];
    latitude: number | null;
    longitude: number | null;
    centralHeating?:boolean;
    garage?:boolean;


}
interface Review {
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  time?: any;
}
