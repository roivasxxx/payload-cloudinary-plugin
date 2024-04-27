# This is a fork of [payload-cloudinary-plugin](https://github.com/finkinfridom/payload-cloudinary-plugin)

The base plugin allows specifying a single cloudinary folder that will be used for uploads, this fork exposes a way of specifying a cloudinary folder on a per image basis

This fork also provides the option to disable the automatic addition of a timestamp to file names during uploads (original file names are only used when [use_filename:true](https://support.cloudinary.com/hc/en-us/articles/202520762-Uploading-assets-and-keeping-their-original-filenames) in the options parameter of mediaManagement is provided, the plugin adds a timestamp to this filename)

# Specifying a folder
Add this field to your Payload upload collection:

```
{
  name: "folder",
  type: "text"
}
```
Fill the field out with your desired cloudinary folder

## If no folder is provided(empty field), it falls back to the folder configured via the options parameter of mediaManagement, defaults to /media

# Disabling automatic addition of timestamp to filenames
## Using this option may introduce issues!

Add this field to your payload upload collection:

```
{
  name: "addFileNameDate",
  type: "checkbox"
}
```
Checking it will disable the addition of a timestamp to file names:

eg: ```image.png``` will remain ```image.png```