import com.typesafe.sbt.SbtScalariform._
import PlayGulp._

import scalariform.formatter.preferences._

name := "play-silhouette-reactivemongo-seed"

version := "4.0.0"

scalaVersion := "2.11.8"

unmanagedClasspath in Runtime += baseDirectory.value / "conf"

// TODO fix me
unmanagedJars in Compile += baseDirectory.value / "biscuit-java-master-SNAPSHOT.jar"
unmanagedJars in Runtime += baseDirectory.value / "biscuit-java-master-SNAPSHOT.jar"
unmanagedJars in Test += baseDirectory.value / "biscuit-java-master-SNAPSHOT.jar"
//unmanagedJars in Compile += baseDirectory.value / "nacl4s_2.10-1.0.0.jar"
//unmanagedJars in Runtime += baseDirectory.value / "nacl4s_2.10-1.0.0.jar"
//unmanagedJars in Test += baseDirectory.value / "nacl4s_2.10-1.0.0.jar"


resolvers += Resolver.jcenterRepo
resolvers += Resolver.url("Typesafe Ivy releases", url("https://repo.typesafe.com/typesafe/ivy-releases"))(Resolver.ivyStylePatterns)
resolvers += "jitpack" at "https://jitpack.io" // Used to resolve com.github.* projects

libraryDependencies ++= Seq(
  "org.reactivemongo" %% "play2-reactivemongo" % "0.12.1",
  "com.mohiva" %% "play-silhouette" % "4.0.0",
  "com.mohiva" %% "play-silhouette-password-bcrypt" % "4.0.0",
  "com.mohiva" %% "play-silhouette-persistence" % "4.0.0",
  "com.mohiva" %% "play-silhouette-crypto-jca" % "4.0.0",
  "com.mohiva" %% "play-silhouette-persistence-reactivemongo" % "4.0.1",
  "net.codingwell" %% "scala-guice" % "4.0.1",
  "com.iheart" %% "ficus" % "1.2.6",
  "com.typesafe.play" %% "play-mailer" % "5.0.0",
  "com.enragedginger" %% "akka-quartz-scheduler" % "1.5.0-akka-2.4.x",
  "com.mohiva" %% "play-silhouette-testkit" % "4.0.0" % "test",
  "com.digitaltangible" %% "play-guard" % "2.0.0",
 // "com.github.dcoker" % "biscuit-java" % "master-SNAPSHOT",
  "com.amazonaws" % "aws-java-sdk-kms" % "1.10.76",
  "com.amazonaws" % "aws-java-sdk-core" % "1.10.76",
  "com.github.emstlk" % "nacl4s_2.10" % "1.0.0",
  "org.yaml" % "snakeyaml" % "1.16",
  specs2 % Test,
  cache,
  filters

)

lazy val root = (project in file("."))
    .enablePlugins(PlayScala)
    .settings(playGulpSettings)

routesGenerator := InjectedRoutesGenerator

routesImport += "utils.route.Binders._"

//********************************************************
// Scalariform settings
//********************************************************

defaultScalariformSettings

ScalariformKeys.preferences := ScalariformKeys.preferences.value
  .setPreference(FormatXml, false)
  .setPreference(DoubleIndentClassDeclaration, false)
  .setPreference(PreserveDanglingCloseParenthesis, true)


// play-gulp settings
unmanagedResourceDirectories in Assets <+= (gulpDirectory in Compile)(base => base / "build")

fork in run := false
