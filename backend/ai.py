# AI
import numpy as np
import cv2
import mediapipe as mp
from tensorflow.keras.models import load_model

# OTHERS
from dotenv import load_dotenv
import os

#===================================================================================================================================
# LOAD .ENV
load_dotenv()

MODEL_NAME = os.getenv("MODEL")

#===================================================================================================================================
# LOAD AI MODEL
model = load_model(MODEL_NAME)

# MEDIAPIPE
IMG_SIZE=(96,96)

THRESHOLD=0.5

mp_face=mp.solutions.face_mesh

face_mesh=mp_face.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

LEFT_EYE=[33,133,160,159,158,157,173]
RIGHT_EYE=[362,263,387,386,385,384,398]

# EYE BOUNDING BOX
def get_eye_box(landmarks, eye_indices, w, h):
    xs=[]
    ys=[]

    for idx in eye_indices:
        lm=landmarks[idx]
        xs.append(int(lm.x*w))

        ys.append(int(lm.y*h))

    return (
        min(xs)-5,
        min(ys)-5,
        max(xs)+5,
        max(ys)+5
    )

last_status = "AWAKE"
last_save_time = 0

# AI PREDICT
def predict_drowsiness(img):
    global last_status

    try:
        h,w,_=img.shape
        rgb=cv2.cvtColor(
            img,
            cv2.COLOR_BGR2RGB
        )
        results=face_mesh.process(
            rgb
        )

        if not results.multi_face_landmarks:
            return {
                "status":"NO_EYE",
                "confidence":0
            }

        scores=[]

        face_landmarks=(
            results.multi_face_landmarks[0]
        )

        lm=face_landmarks.landmark

        boxes=[

            get_eye_box(

                lm,

                LEFT_EYE,

                w,

                h

            ),

            get_eye_box(

                lm,

                RIGHT_EYE,

                w,

                h
            )

        ]


        for (

            x1,
            y1,
            x2,
            y2

        ) in boxes:


            x1=max(x1,0)

            y1=max(y1,0)

            x2=min(x2,w)

            y2=min(y2,h)


            eye=img[
                y1:y2,
                x1:x2
            ]


            if eye.size==0:

                continue


            gray=cv2.cvtColor(

                eye,

                cv2.COLOR_BGR2GRAY
            )


            eye=cv2.resize(

                gray,

                IMG_SIZE
            )


            eye=eye.astype(
                "float32"
            )/255.0


            eye=np.expand_dims(

                eye,

                axis=(0,-1)
            )


            score=float(

                model.predict(

                    eye,

                    verbose=0

                )[0][0]
            )


            scores.append(
                score
            )


        if len(scores)==0:

            return {

                "status":"NO_EYE",

                "confidence":0
            }


        avg_score=np.mean(
            scores
        )


        status=(

            "AWAKE"

            if avg_score>

            THRESHOLD

            else

            "DROWSY"

        )


        confidence=max(

            avg_score,

            1-avg_score

        )*100


        last_status=status


        result={

            "status":status,

            "confidence":

            round(
                float(confidence),
                2
            ),

            "value":

            round(
                float(avg_score),
                4
            )
        }


        print(
            "AI RESULT:",
            result
        )


        return result


    except Exception as e:

        print(

            "PREDICT ERROR:",
            e
        )

        return {

            "status":last_status,

            "confidence":0
        }
