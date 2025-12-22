import image from "@/assets/images/icon/IMG.png";
import video from "@/assets/images/icon/video.png";
import audio from "@/assets/images/icon/audio.png";
import docs from "@/assets/images/icon/Docs.png";
import excel from "@/assets/images/icon/Excel.png";
import pdf from "@/assets/images/icon/PDF.png";
import aab from "@/assets/images/icon/AAB.png";
import apk from "@/assets/images/icon/APK.png";
import css from "@/assets/images/icon/CSS.png";
import csv from "@/assets/images/icon/CSV.png";
import html from "@/assets/images/icon/HTML.png";
import JS from "@/assets/images/icon/JS.png";
import txt from "@/assets/images/txt.png";
import php from "@/assets/images/php.png";
import ppt from "@/assets/images/icon/PPT.png";
import psd from "@/assets/images/icon/PSD.png";
import sql from "@/assets/images/icon/SQL.png";
import zip from "@/assets/images/icon/ZIP.png";
import json from "@/assets/images/icon/json.png";

export default [
    {
        type: ["image"],
        ext: [],
        url: image,
    },
    {
        type: ["video"],
        ext: ["mp4", "mkv"],
        url: video,
    },
    {
        type: ["audio"],
        ext: [],
        url: audio,
    },
    {
        type: ["docs"],
        ext: ["doc", "docs"],
        url: docs,
    },
    {
        type: ["excel", "sheet"],
        ext: ["xls", "xlsx"],
        url: excel,
    },
    {
        type: ["pdf"],
        ext: ["pdf"],
        url: pdf,
    },
    {
        ext: ["ppt", "pptx"],
        url: ppt,
    },
    {
        ext: ["psd"],
        url: psd,
    },
    {
        ext: ["js"],
        url: JS,
    },
    {
        ext: ["html"],
        url: html,
    },
    {
        ext: ["css"],
        url: css,
    },
    {
        ext: ["php"],
        url: php,
    },
    {
        ext: ["sql"],
        url: sql,
    },
    {
        ext: ["txt"],
        url: txt,
    },
    {
        ext: ["apk"],
        url: apk,
    },
    {
        ext: ["aab"],
        url: aab,
    },
    {
        ext: ["csv"],
        url: csv,
    },
    {
		ext: ["zip"],
        url: zip,
    },
    {
        ext: ["json"],
        url: json,
    },
];
