export type IFileImage = Pick<
  Express.Multer.File,
  | 'fieldname'
  | 'originalname'
  | 'mimetype'
  | 'destination'
  | 'filename'
  | 'path'
  | 'size'
>;

export type IFilesImage = IFileImage[];
