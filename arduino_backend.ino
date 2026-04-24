const int sensor1 = 3;
const int sensor2 = 2;

const int trigPin = 10;
const int echoPin = 11;

const int buzzer = 12;
const int led = 13;

const int ldrPin = A0;

float distanceBetweenSensors = 0.10; // 10 cm
float speedLimit = 10.0;

volatile unsigned long time1 = 0;
volatile unsigned long time2 = 0;

volatile bool firstTriggered = false;
volatile bool secondTriggered = false;

bool ultrasonicTriggered = false;

// Interrupts
void sensor1Trigger() {
  if (!firstTriggered) {
    time1 = micros();
    firstTriggered = true;
  }
}

void sensor2Trigger() {
  if (firstTriggered && !secondTriggered) {
    time2 = micros();
    secondTriggered = true;
  }
}

void setup() {
  pinMode(sensor1, INPUT);
  pinMode(sensor2, INPUT);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(buzzer, OUTPUT);
  pinMode(led, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(sensor1), sensor1Trigger, FALLING);
  attachInterrupt(digitalPinToInterrupt(sensor2), sensor2Trigger, FALLING);

  Serial.begin(9600);
}

// Ultrasonic distance function
float getDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000); // timeout for stability
  if (duration == 0) {
    return -1; // no echo
  }

  return duration * 0.034 / 2.0; // cm
}

void loop() {
  // Ultrasonic check
  float dist = getDistance();

  // Send live distance to frontend
  if (dist > 0) {
    Serial.print("Distance: ");
    Serial.print(dist, 2);
    Serial.println(" cm");

    if (dist < 100 && dist > 2) {
      ultrasonicTriggered = true;
    }
  }

  // LDR
  int raw = analogRead(ldrPin);
  int lightValue = 1023 - raw;

  bool isNight = (lightValue < 400);

  // Speed calculation
  if (firstTriggered && secondTriggered && ultrasonicTriggered) {
    float timeTaken = (time2 - time1) / 1000000.0;

    if (timeTaken > 0) {
      float speed = (distanceBetweenSensors / timeTaken) * 3.6;

      Serial.println("------ VEHICLE DETECTED ------");

      Serial.print("Time: ");
      Serial.print(timeTaken, 6);
      Serial.println(" sec");

      Serial.print("Speed: ");
      Serial.print(speed, 2);
      Serial.println(" km/h");

      Serial.print("Distance: ");
      Serial.print(dist, 2);
      Serial.println(" cm");

      Serial.print("LDR_RAW: ");
      Serial.println(raw);

      Serial.print("LDR_FIXED: ");
      Serial.println(lightValue);

      Serial.print("Light: ");
      Serial.println(isNight ? "Night" : "Day");

      if (speed > speedLimit) {
        Serial.println("STATUS: OVER SPEED!");
        digitalWrite(buzzer, HIGH);
        digitalWrite(led, HIGH);
      } else {
        Serial.println("STATUS: Normal");
        digitalWrite(buzzer, LOW);
        digitalWrite(led, LOW);
      }

      Serial.println("-----------------------------");
      Serial.println();
    }

    delay(1000);

    firstTriggered = false;
    secondTriggered = false;
    ultrasonicTriggered = false;
  }

  delay(200);
}
