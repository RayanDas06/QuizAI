# TeachTok
This is our [AI ATL](aiatl.io) '24 submission! Check it out [on devpost](https://devpost.com/software/teachtok)!
## Try it out!
download the expo go app and scan this qr code to try it out! It's currently hosted on the free tier of AWS and [Cartesia](cartesia.ai) (our voice cloning provider).

<img width="208" alt="expo go qr code" src="https://github.com/user-attachments/assets/c7ffcee1-7519-482b-9be6-b506eb9ffca6" />

## Inspiration
Social media platforms like TikTok and Instagram have mastered the art of user engagement, successfully keeping individuals glued to their screens for prolonged periods. This is the main cause of the concerning trend of excessive screen time and potential addiction. Students are constantly seeking more effective and efficient study methods to improve their academic performance. However, the prevalence of social media usage among students often leads to significant time wastage, distracting them from their educational pursuits. These platforms pose even more extreme risks, including exposure to misinformation and potentially harmful content, which can negatively impact users' knowledge and well-being. This combination of addictive design, wasted time, and content-related risks creates a challenging environment for students trying to balance their social media use with productive study habits. 
This attention-grabbing nature of platforms like TikTok does present an opportunity for educational benefit. By creating educational content in a similar short-form video style, we can leverage the same engaging qualities that make social media so addictive, but for a more constructive purpose. This approach is particularly relevant given that teenagers, who are among the most avid consumers of social media content, are also significantly impacted by its effects on their education and daily lives. By generating educational videos in this "TikTok-like" format, we can meet young learners where they already spend much of their time, transforming passive scrolling into active learning.

## What it does
TeachTok allows users to upload their study notes, which the app then transforms into interactive TikTok-style quizzes with multiple choice questions that are read by an AI-generated Peter Griffin voice. After picking an answer, users receive detailed feedback that explains why the question is right or wrong.

## How we built it
We utilized MongoDB for our database to efficiently store and manage user-generated content and quiz data. Images and audio tracks are stored in an s3 bucket directly on AWS and our backend is hosted on AWS Lambda. We send images of our notes to Claude using the Vercel AI sdk, and Claude outputs a set of questions. These questions are sent to an SQS queue to prevent our lambda functions from timing out, which is where we use Cartesia to generate the audio. The frontend is a React Native app built using expo and expo router. 

## Challenges we ran into
One of the main challenges was ensuring the AI-generated quizzes were relevant and accurately reflected the uploaded notes. Our biggest challenge was getting tiktok like scrolling working in react native. We ran into multiple bugs in React Native, including with multipart form data, and inconsistent fetch behavior between Android and iOS. Because of this, we settled on using buttons to navigate between questions instead of the Tiktok style scrolling we were aiming for. 

## Accomplishments that we're proud of
We successfully created an app that generates questions that are relevant to the content presented in images taken by the user. Additionally, the explanations for the answers were quite detailed and accurate. The integration of AI and brain rot humor has made the app more engaging.

## What we learned
We learned the importance of balancing educational content with entertainment to keep users engaged. Additionally, we gained valuable insights into the capabilities and limitations of AI in generating personalized learning experiences.

## What's next for TeachTok
Looking ahead, we plan to expand the app’s features, such as incorporating more diverse multimedia content (e.g. using other celebrity voices), enhancing the AI's capabilities, and creating a community forum for users to share tips and study strategies. We also aim to explore partnerships with educational institutions to reach a wider audience.
