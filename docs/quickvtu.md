# QuickVTU Documentation

## Introduction

Welcome to the QuickVTU API! You can use our API to access QuickVTU API endpoints, which can be used to purchase any of our services and products in our database.

We have language bindings in PHP, Ruby, Python, React JS, and JavaScript. You can use any programming language of your choice to connect to our endpoints.

This QuickVTU API documentation page was created to assist you through the integration process.

---

## Authentication

### How to Generate Token

Basic Authentication is used to generate the **AccessToken**. It should be passed as a concatenated string like this: `username:password`.

Please use the following details for authentication:

- **Username:** Your QuickVTU Username
- **Password:** Your QuickVTU Password

Convert it to `base64(username:password)` and use it to generate the token.

### Endpoint URL (Authentication)

`POST https://quickvtu.com/api/user`

### Code Sample (PHP)

```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://quickvtu.com/api/user");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Basic " . base64_encode('username:password'),
]);
$json = curl_exec($ch);
curl_close($ch);
```

### Expected Response

```json
{
  "status": "success",
  "AccessToken": "c371906aa63b8447dbb5665440d7634c379edccda94af3353e33be075b73",
  "balance": "21.00",
  "username": "musamusak"
}
```

---

## Data Subscription API

This section contains the recommended flow for integrating Data Subscription services on the QuickVTU RESTful API.

### Available Parameters

To integrate the QuickVTU Data Subscription Payment RESTful API, use the following parameters:

1. `network`: (Integer) Network ID
2. `phone`: (String) Destination phone number
3. `data_plan`: (Integer) Data Plan ID
4. `bypass`: (Boolean)
5. `request-id`: (String) Unique request ID

### Network Plan IDs

| Network | Plan ID |
| :------ | :------ |
| MTN     | 1       |
| GLO     | 3       |
| AIRTEL  | 2       |
| 9MOBILE | 4       |

### Data Plans

| Plan ID | Network | Plan Type | Plan Name | Amount | Validity |
| :------ | :------ | :-------- | :-------- | :----- | :------- |
| 4       | MTN     | SME       | 500MB     | ₦390   | 1 Month  |
| 5       | MTN     | SME       | 1GB       | ₦500   | 1 Month  |
| 6       | MTN     | SME       | 2GB       | ₦1,200 | 1 Month  |
| 7       | MTN     | SME       | 3GB       | ₦1,800 | 1 Month  |
| 8       | MTN     | SME       | 5GB       | ₦3,000 | 1 Month  |
| 24      | GLO     | GIFTING   | 1.5GB     | ₦465   | 1 Month  |
| 25      | GLO     | GIFTING   | 2.9GB     | ₦940   | 1 Month  |
| 26      | GLO     | GIFTING   | 4.1GB     | ₦1,300 | 1 Month  |
| 27      | GLO     | GIFTING   | 5.8GB     | ₦1,860 | 1 Month  |
| 28      | GLO     | GIFTING   | 10GB      | ₦3,020 | 1 Month  |
| 29      | 9MOBILE | SME       | 1.1GB     | ₦399   | 1 Month  |
| 30      | 9MOBILE | SME       | 2GB       | ₦760   | 1 Month  |
| 33      | 9MOBILE | GIFTING   | 1.5GB     | ₦900   | 1 Month  |
| 34      | 9MOBILE | GIFTING   | 500MB     | ₦450   | 1 Month  |

### Purchase Product

**Endpoint URL:** `POST https://quickvtu.com/api/data`

#### Code Sample (PHP)

```php
$payload = array(
    'network' => 1,
    'phone' => '09133896509',
    'data_plan' => 5,
    'bypass' => false,
    'request-id' => 'Data_' . time()
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://quickvtu.com/api/data');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$headers = [
    "Authorization: Token YOUR_ACCESS_TOKEN",
    'Content-Type: application/json'
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
curl_close($ch);
```

#### Expected Response

```json
{
  "network": "MTN",
  "request-id": "Data_1234567890",
  "amount": "100",
  "dataplan": "500MB",
  "status": "success",
  "message": "Transaction successful",
  "phone_number": "07013397088",
  "oldbal": "110325",
  "newbal": 110225,
  "system": "API",
  "plan_type": "GIFTING",
  "wallet_vending": "wallet"
}
```

---

## Airtime Subscription API

This section contains the recommended flow for integrating Airtime Subscription services.

### Available Parameters

1. `network`: (Integer) Network ID
2. `phone`: (String) Destination phone number
3. `plan_type`: (String) e.g., 'VTU'
4. `amount`: (Integer) Amount in Naira
5. `bypass`: (Boolean)
6. `request-id`: (String) Unique request ID

### Purchase Product

**Endpoint URL:** `POST https://quickvtu.com/api/topup/`

#### Code Sample (PHP)

```php
$payload = array(
    'network' => 1,
    'phone' => '09133896509',
    'plan_type' => 'VTU',
    'bypass' => false,
    'amount' => 100,
    'request-id' => 'Airtime_' . time()
);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://quickvtu.com/api/topup');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$headers = [
    "Authorization: Token YOUR_ACCESS_TOKEN",
    'Content-Type: application/json'
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$response = curl_exec($ch);
curl_close($ch);
```

#### Expected Response

```json
{
  "network": "MTN",
  "request-id": "Airtime_1234567890",
  "amount": 100,
  "discount": 97,
  "status": "success",
  "message": "successfully purchase MTN VTU to 07013397088 , ₦100",
  "phone_number": "07013397088",
  "oldbal": "110225",
  "newbal": 110128,
  "system": "API",
  "plan_type": "VTU",
  "wallet_vending": "wallet"
}
```

## Cable (TV) Subscription API

This section contains the recommended flow for integrating Cable Subscription services on the Quickvtu RESTful API.

### Available Endpoints

To integrate the Quickvtu Cable Subscription Payment RESTful API, the endpoints below applies:

1. `cable`
2. `iuc`
3. `cable_plan`
4. `bypass` (boolean)
5. `request-id` (unique)

### Cable ID

| Cable   | Plan ID |
| :------ | :------ |
| DSTV    | 2       |
| GOTV    | 1       |
| STARTIME| 3       |

### Cable Plans

| Plan ID | Cable   | Plan Name      | Amount |
| :------ | :------ | :------------- | :----- |
| 1       | DSTV    | DStv Padi      | ₦3600  |
| 2       | DSTV    | DSTV-YANGA     | ₦4200  |
| 3       | DSTV    | DStv Compact   | ₦12,500|
| 5       | DSTV    | DStv Premium   | ₦29,510|
| 6       | DSTV    | DStv Asia      | ₦12,400|

### PURCHASE PRODUCT

Using a POST method, Cable bundle can with the endpoint below:

### Enpoint URL

`https://quickvtu.com/api/cable`

### Code Sample

```curl
                $paypload = array(
                    'cable' => 1,
                     'iuc' => 09133896509,
                     'cable_plan' => 1,
                     'bypass' => false,
                     'request-id' => Cable_12345678900);
                     $ch = curl_init();
                     curl_setopt($ch, CURLOPT_URL, 'https://quickvtu.com/api/cable');
                     curl_setopt($ch, CURLOPT_POST, 1);
                     curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paypload));
                     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                     $headers = [
                          "Authorization: Token c371906aa63b8447dbb5665440d7634c379edccda94af3353e33be075b73",
                         'Content-Type: application/json'
                     ];
                     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                     $response = curl_exec($ch);
                     curl_close($ch);
```

### Expected Response (Cable Purchase)

```json
   {
                    "cabl_name": "DSTV",
                    "request-id": "Cable_1234567890",
                    "amount": "12000",
                    "charges": 6000,
                    "status": "success",
                    "message": "successfully purchase DSTV joli joli ₦12000 to 0701339708866",
                    "iuc": "0701339708866",
                    "oldbal": "110128",
                    "newbal": 92128,
                    "system": "API",
                    "wallet_vending": "wallet",
                    "plan_name": "joli joli"
                }
```

## IUC Verification API

This section contains the recommended flow for integrating IUC Verification services on the Quickvtu RESTful API.

### Available Endpoints (IUC Verification)

1. `iuc`
2. `cable`

### Cable ID (IUC Verification)

| Cable   | Plan ID |
| :------ | :------ |
| DSTV    | 2       |
| GOTV    | 1       |
| STARTIME| 3       |

### VERIFY IUC NUMBER

Using a GET method, IUC Verification bundle can with the endpoint below:

### Enpoint URL (IUC Verification)

`https://quickvtu.com/api/cable/cable-validation?iuc=12345555&cable=1`

### Expected Response (IUC Verification)

```json
  {
                    "status": "success",
                    "name": "ADEX DEVELOPER"
                }
```

## Electricity Bill Subscription API

This section contains the recommended flow for integrating Electricity Bill Subscription services on the Quickvtu RESTful API.

### Available Endpoints (Electricity Bill Subscription)

To integrate the Quickvtu Electricity Bill Subscription Payment RESTful API, the endpoints below applies:

1. `disco`
2. `meter_type`
3. `meter_number`
4. `amount`
5. `bypass` (boolean)
6. `request-id` (unique)

### Disco ID

| Disco Name               | Plan ID |
| :----------------------- | :------ |
| Ikeja Electricity        | 1       |
| Eko Electricity          | 2       |
| Kano Electricity         | 3       |
| Port Harcourt Electricity| 4       |
| Joss Electricity.        | 5       |
| Ibadan Electricity.      | 6       |
| Kaduna Electricity       | 7       |
| Abuja Electricity.       | 8       |
| Benin Electricity.       | 9       |
| Enugu Electricity.       | 10      |

### PURCHASE PRODUCT (Electricity Bill Subscription)

Using a POST method, Electricity Bill can with the endpoint below:

### Enpoint URL (Electricity Bill Subscription)

`https://quickvtu.com/api/bill`

### Code Sample (Electricity Bill Subscription)

```curl
  $paypload = array(
                    'disco' => 1,
                     'meter_type' => 'prepaid',
                     'meter_number' => 09133896509,
                     'amount' => 300
                     'bypass' => false,
                     'request-id' => Bill_12345678900);
                     $ch = curl_init();
                     curl_setopt($ch, CURLOPT_URL, 'https://quickvtu.com/api/bill');
                     curl_setopt($ch, CURLOPT_POST, 1);
                     curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paypload));
                     curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                     $headers = [
                          "Authorization: Token c371906aa63b8447dbb5665440d7634c379edccda94af3353e33be075b73",
                         'Content-Type: application/json'
                     ];
                     curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
                     $response = curl_exec($ch);
                     curl_close($ch);
```

### Expected Response (Electricity Bill Subscription)

```json
 {
                    "disco_name": "ADEX DISO",
                    "request-id": "Bill_1234567890",
                    "amount": 300,
                    "charges": 21,
                    "status": "success",
                    "message": "Transaction  successful ADEX DISO PREPAID ₦300 to 0701339708866",
                    "meter_number": "0701339708866",
                    "meter_type": "POSTPAID",
                    "oldbal": "92128",
                    "newbal": 91807,
                    "system": "API",
                    "token" : ""
                    "wallet_vending": "wallet"
                }
```

## Meter Number Verification API

This section contains the recommended flow for integrating Meter Number Verification services on the Quickvtu RESTful API.

### Available Endpoints (Electricity Meter NUmber Verification)

To integrate the Quickvtu Meter Number Verification Payment RESTful API, the endpoints below applies:

1. meter_type
2. disco
3. meter_number

### Disco ID (Electricity Meter Number Verification)

| Disco Name               | Plan ID |
| :----------------------- | :------ |
| Ikeja Electricity        | 1       |
| Eko Electricity          | 2       |
| Kano Electricity         | 3       |
| Port Harcourt Electricity| 4       |
| Joss Electricity.        | 5       |
| Ibadan Electricity.      | 6       |
| Kaduna Electricity       | 7       |
| Abuja Electricity.       | 8       |
| Benin Electricity.       | 9       |
| Enugu Electricity.       | 10      |

### VERIFY METER NUMBER

Using a GET method, IUC Verification bundle can with the endpoint below:

### Enpoint URL (Electricity Meter Number Verification)

`https://quickvtu.com/api/bill/bill-validation?meter_number=12345555&disco=1&meter_type=postpaid`

### Expected Response (Electricity Meter Number Verification)

```json
  {
                    "status": "success",
                    "name": "ADEX DEVELOPER"
                }
```
