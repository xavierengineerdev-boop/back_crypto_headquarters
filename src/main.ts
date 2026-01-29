import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Noxprilend API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger is available on: http://localhost:${port}/docs`);
}

bootstrap();
