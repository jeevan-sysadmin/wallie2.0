// src/pages/api/upload.js
import { Storage } from 'aws-amplify';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const formData = req.body;
      const file = formData.file;

      if (!file) {
        return res.status(400).json({ error: 'No file provided.' });
      }

      if (file.type.startsWith('video')) {
        const uploadResult = await Storage.put(file.name, file, {
          contentType: file.type,
        });

        return res.status(200).json({
          message: 'Video file uploaded successfully to S3.',
          location: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${uploadResult.key}`,
        });
      } else if (file.type.startsWith('audio')) {
        const tempFilePath = path.join(os.tmpdir(), file.name);
        const writeStream = createWriteStream(tempFilePath);
        writeStream.write(Buffer.from(file.arrayBuffer()));
        writeStream.end();

        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        const transcript = await openai.audio.transcriptions.create({
          file: createReadStream(tempFilePath),
          model: 'whisper-1',
          language: 'en',
        });

        await fs.promises.unlink(tempFilePath);

        return res.status(200).json({ text: transcript.text });
      } else {
        return res.status(400).json({ error: 'Unsupported file type.' });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
