import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import AWS from 'aws-sdk'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // Log the received FormData
    console.log('Received FormData:', formData)

    // Extract information about the 'audio' file
    const audioFile = formData.get('audio');

    if (!(audioFile instanceof File)) {
      console.error('No audio file provided or invalid file type.')

      return NextResponse.error()
    }

    console.log('Audio file name:', audioFile.name)
    console.log('Audio file size:', audioFile.size)
    console.log('Audio file type:', audioFile.type)

    // Check if the uploaded file is a video
    if (audioFile.type.startsWith('video')) {
      // Upload the video file to S3
      const s3 = new AWS.S3();
      const uploadParams = {
        Bucket: 'your-bucket-name',
        Key: `videos/${audioFile.name}`, // Adjust the S3 key as needed
        Body: audioFile.stream()
      };
      const s3UploadResponse = await s3.upload(uploadParams).promise();
      console.log('File uploaded to S3:', s3UploadResponse.Location);

      return NextResponse.json({
        text: 'Video uploaded to S3',
        s3Path: s3UploadResponse.Location
      })
    } else {
      return NextResponse.json({
        text: 'Transcription completed'
      })
    }
  } catch (error) {
    // Handle errors
    console.error('Error:', error)

    return NextResponse.error()
  }
}
