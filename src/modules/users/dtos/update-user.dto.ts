import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator";
export class UpdateUser{
    @ApiProperty({description: "Nhập email",default: false})
    @IsString()
    email: string;

    @ApiProperty({description: "Nhập giới tính true/false",default: false})
    @IsOptional()
    sex: 'male' | 'female';

    @ApiProperty({description: "Nhập ngày sinh",default: false})
    @IsDate()
    birthday: Date;

    @ApiProperty({description: "Nhập sdt",default: false})
    @IsString()
    phone: string;

    @ApiProperty({description: "Nhập họ tên",default: false})
    @IsString()
    fullname: string;

    @ApiProperty({description: "avatar",default: false})
    @IsString()
    avatar: string;
}