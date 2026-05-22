import cv2
import numpy as np
from tensorflow import keras

# 1. Load your pre-trained model
# model = keras.models.load_model('eye_model1.keras 2\eye_model1.keras')
# model = keras.models.load_model('eye_model.h5')
model = keras.models.load_model('model\eye_model_22mei.keras')

# 2. Start webcam capture
cap = cv2.VideoCapture(0)

while True:
    # 3. Read frame-by-frame
    ret, frame = cap.read()
    if not ret: break

    # Preprocessing (must match your training data)
    img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    img = cv2.resize(img, (96, 96))

    img = img.astype("float32") / 255.0

    img = np.expand_dims(img, axis=-1)

    img = np.expand_dims(img, axis=0)


    # img = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # img = cv2.resize(img, (64, 64))

    # img = img.astype("float32") / 255.0

    # img = np.expand_dims(img, axis=-1)

    # img = np.expand_dims(img, axis=0)


    print("INPUT SHAPE:", img.shape)

    # Inference
    predictions = model.predict(img, verbose=0)

    print("RAW PREDICTION:", predictions)

    value = float(predictions[0][0])

    print("RAW VALUE:", value)

    # =====================================
    # STATUS
    # =====================================
    # if value >= 0.80:

    #     status = "AWAKE"

    # elif value <= 0.20:

    #     status = "DROWSY"
    status = "AWAKE" if value > 0.50 else "DROWSY"

    # else:

    #     status = last_status

    last_status = status

    # =====================================
    # CONFIDENCE
    # =====================================
    confidence = max(
        value,
        1 - value
    ) * 100

    result = {

        "status": status,

        "confidence": round(confidence, 2),

        "value": round(value, 4)
    }

    print("AI RESULT:", result)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 4. Cleanup
cap.release()
cv2.destroyAllWindows()
