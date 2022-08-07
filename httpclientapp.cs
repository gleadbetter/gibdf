       private static void Upload()
        {
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("User-Agent", "C# Test API");

                using (var content = new MultipartFormDataContent())
                {
                    var path = @"C:\Users\gib.leadbetter\Pictures\gib.jpg";
                    string assetName = Path.GetFileName(path);

                    // https://stackoverflow.com/questions/50012862/how-to-add-variables-inside-a-stringcontent
                    // https://stackoverflow.com/questions/16416601/c-sharp-httpclient-4-5-multipart-form-data-upload
                    // https://stackoverflow.com/questions/10679214/how-do-you-set-the-content-type-header-for-an-httpclient-request

                    // Following is the key value pairs (data) which we need to send to server via API.
                    Dictionary<string, string> jsonValues = new Dictionary<string, string>();
                    jsonValues.Add("file", "gib.jpg");
                    jsonValues.Add("description", "description test"); // better to encrypt passwod before sending to API.

                    //jsonValues.Add("username", "testuser");
                    //jsonValues.Add("password", "XXXXXXXXXX"); // better to encrypt passwod before sending to API.
                    //HttpClient client = new HttpClient();

                    // Used Newtonsoft.Json library to convert object to json string. It is available in Nuget package.
                    //StringContent sc = new StringContent(JsonConvert.SerializeObject(jsonValues), UnicodeEncoding.UTF8, "application/json");
                    //HttpResponseMessage response = await client.PostAsync(webAddress, sc);

                    //string content = await response.Content.ReadAsStringAsync();
                    //Console.WriteLine("Result: " + content);

                    //str = "{ "context_name": { "lower_bound": "value", "upper_bound": "value", "values": [ "value1", "valueN" ] } }"

                    //request.Content = new StringContent("{\"file\":\"gib.jpg\",\"description\":description test}",
                    //                Encoding.UTF8,
                    //                "application/json");//CONTENT-TYPE header

                    //Content-Disposition: form-data; name="json"
                    //StringContent sc = new StringContent(JsonConvert.SerializeObject(jsonValues), UnicodeEncoding.UTF8, "application/json");
                    var stringContent = new StringContent(JsonConvert.SerializeObject(jsonValues));

                    //var stringContent = new StringContent(JsonConvert.SerializeObject(request));

                    //stringContent.Headers.Add("Content-Disposition", "form-data; name=\"json\"");
                    //content.Add(stringContent, "json");

                    // Stream the File
                    FileStream fs = File.OpenRead(path);
                    var streamContent = new StreamContent(fs);

                    //Content-Disposition: form-data; name="file"; filename="name of file goes here";
                    streamContent.Headers.Add("Content-Type", "image/png");
                    streamContent.Headers.Add("Content-Disposition", "form-data; name=\"file\"; filename=\"" + Path.GetFileName(path) + "\"");
                    content.Add(streamContent, "file", Path.GetFileName(path));

                    //content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");

                    Task<HttpResponseMessage> message = client.PostAsync("http://localhost:5000/upload", content);

                    var input = message.Result.Content.ReadAsStringAsync();
                    Console.WriteLine(input.Result);
                    Console.Read();
                }
            }
        }