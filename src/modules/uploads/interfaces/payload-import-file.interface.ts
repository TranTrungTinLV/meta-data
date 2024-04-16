import { Types } from 'mongoose';

export interface IPImportAssetFromCSV {
    images: string[];
    name: string[];
    description: string;
    total_quantity: number;
    original_price: number;
    now_price: number;
    msf: Date;
    exp: Date;
    location_id: Types.ObjectId | string;
    category_id: Types.ObjectId | string;
}
