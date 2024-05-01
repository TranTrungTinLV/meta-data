import { elasticSearchApi } from 'src/modules/product/api/elasticsearch-api';
import { Transform } from 'stream';
import * as winston from 'winston';

export const logger = winston.createLogger(
    {
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({filename: 'logs/app.log'})
        ]
    }
)


export const bulkUpdateElasticsearchTransformer = (logger: winston.Logger) => {
    new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        async transform(chunks, encoding, callback) {
            logger.info("Pausing the stream for some transform");
            this.pause();
      
            const data = chunks.map((product) => {
              const searchableProduct = {
                sku: product.sku,
                name: product.name,
                type: product.type,
                category: product.category.map((cat) => ({ name: cat.name })),
                description: product.description,
                manufacturer: product.manufacturer,
              };
              return `\n{ "index":{ "_id": "${product._id}" } }\n${JSON.stringify(searchableProduct)}`;
            });
      
      
            try {
              await elasticSearchApi.post("/playground/products/_bulk", data.concat("\n").join(""));
            } catch (error) {
              console.log(error);
            }
      
            setTimeout(() => {
              logger.info("Starting the flowing mode again");
              this.resume();
              callback();
            }, 1000);
          },
    })
}



