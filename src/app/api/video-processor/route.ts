import { NextRequest, NextResponse } from 'next/server';
import { Storage } from 'aws-amplify';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio');

    if (!file) {
      console.error('No file provided.');
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.type.startsWith('video')) {
      // Upload video file to S3 using Amplify
      const uploadResult = await Storage.put(file.name, file, {
        contentType: file.type
      });

      console.log('File uploaded successfully to S3:', uploadResult.key);

      return NextResponse.json({
        message: 'Video file uploaded successfully to S3.',
        location: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadResult.key}`
      });
      
    } else if (file.type.startsWith('audio')) {
      // Process audio file for transcription
      console.log('Audio file name:', file.name);
      console.log('Audio file size:', file.size);
      console.log('Audio file type:', file.type);

      // Generate a temporary file path
      const tempFilePath = path.join(os.tmpdir(), file.name);

      // Write the file to the temporary path using a stream
      const writeStream = createWriteStream(tempFilePath);
      writeStream.write(Buffer.from(await file.arrayBuffer()));
      writeStream.end();

      // Wait for the write stream to finish
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY // Use the OpenAI API key from environment variables
      });

      const transcript = await openai.audio.transcriptions.create({
        file: createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'en'
      });

      // Delete the temporary file
      await fs.promises.unlink(tempFilePath);

      return NextResponse.json({
        text: transcript.text
      });
    } else {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing the file.' }, { status: 500 });
  }
}
