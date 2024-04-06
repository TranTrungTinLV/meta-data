import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class ChangePasswordDto {
    @ApiProperty({description: 'mật khẩu cũ'})
    @IsNotEmpty()
    @IsString()
    readonly oldpassword: string;

    @ApiProperty({description: 'mật khẩu mới'})
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    readonly newpassword: string;
    
}